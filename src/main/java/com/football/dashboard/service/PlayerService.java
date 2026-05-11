package com.football.dashboard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
public class PlayerService {

    private static final Logger log = LoggerFactory.getLogger(PlayerService.class);
    private final WebClient footballApiClient;

    @Autowired
    public PlayerService(WebClient footballApiClient) {
        this.footballApiClient = footballApiClient;
    }

    @Cacheable(value = "player", key = "'search-' + #name.toLowerCase()")
    public Map<String, Object> searchPlayers(String name) {
        log.debug("Searching players: {}", name);
        return footballApiClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/persons")
                        .queryParam("name", name)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Player search failed for '{}': {}", name, e.getMessage()))
                .onErrorReturn(Map.of("persons", List.of()))
                .block();
    }

    @Cacheable(value = "player", key = "#playerId + '-' + #season")
    public Map<String, Object> getPlayerStats(Long playerId, String season) {
        log.debug("Fetching stats for player {} season {}", playerId, season);

        Map<String, Object> profile = footballApiClient.get()
                .uri("/persons/{id}", playerId)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of())
                .block();

        String seasonParam = season != null ? season : getCurrentSeason();
        Map<String, Object> matches = footballApiClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/persons/{id}/matches")
                        .queryParam("season", seasonParam)
                        .queryParam("limit", 50)
                        .build(playerId))
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of("matches", List.of()))
                .block();

        Map<String, Object> aggregatedStats = aggregatePlayerStats(matches);
        Map<String, Object> result = new HashMap<>(profile);
        result.putAll(aggregatedStats);
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> aggregatePlayerStats(Map<String, Object> matchesResponse) {
        List<Map<String, Object>> matches =
                (List<Map<String, Object>>) matchesResponse.getOrDefault("matches", List.of());
        int played = matches.size();
        return Map.of(
                "matchesPlayed", played,
                "goals", 0,
                "assists", 0,
                "fouls", 0,
                "avgRating", 0.0,
                "note", "Detailed stats require API-Football (RapidAPI) for full coverage"
        );
    }

    public List<Map<String, Object>> comparePlayers(List<Long> playerIds, String season) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (Long id : playerIds) {
            results.add(getPlayerStats(id, season));
        }
        return results;
    }

    private String getCurrentSeason() {
        return String.valueOf(java.time.Year.now().getValue() - 1);
    }
}
