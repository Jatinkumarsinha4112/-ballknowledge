package com.football.dashboard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FormPredictorService {

    private static final Logger log = LoggerFactory.getLogger(FormPredictorService.class);

    @Autowired
    private MatchService matchService;

    @Cacheable(value = "form", key = "#teamId")
    public Map<String, Object> getTeamForm(long teamId) {
        log.debug("Getting form for team: {}", teamId);
        try {
            // Try all leagues to find this team's matches
            String[] leagues = {"PL", "PD", "BL1", "SA", "FL1"};
            List<Map<String, Object>> teamMatches = new ArrayList<>();

            for (String league : leagues) {
                Map<String, Object> data = matchService.getMatchesByLeague(league);
                List<Map<String, Object>> matches = (List<Map<String, Object>>) data.get("matches");
                if (matches == null) continue;
                for (Map<String, Object> match : matches) {
                    Map<String, Object> home = (Map<String, Object>) match.get("homeTeam");
                    Map<String, Object> away = (Map<String, Object>) match.get("awayTeam");
                    if (home == null || away == null) continue;
                    Object homeId = home.get("id");
                    Object awayId = away.get("id");
                    if (homeId == null || awayId == null) continue;
                    long hId = ((Number) homeId).longValue();
                    long aId = ((Number) awayId).longValue();
                    if ((hId == teamId || aId == teamId) &&
                        "FINISHED".equals(match.get("status"))) {
                        teamMatches.add(match);
                    }
                }
                if (!teamMatches.isEmpty()) break;
            }

            // Sort by date descending
            teamMatches.sort((a, b) -> {
                String dateA = (String) a.get("utcDate");
                String dateB = (String) b.get("utcDate");
                if (dateA == null || dateB == null) return 0;
                return dateB.compareTo(dateA);
            });

            List<Map<String, Object>> recent = teamMatches.subList(0, Math.min(10, teamMatches.size()));

            int wins = 0, draws = 0, losses = 0;
            List<String> results = new ArrayList<>();

            for (Map<String, Object> match : recent) {
                Map<String, Object> score = (Map<String, Object>) match.get("score");
                if (score == null) continue;
                Map<String, Object> ft = (Map<String, Object>) score.get("fullTime");
                if (ft == null) continue;
                Object homeGoalsObj = ft.get("home");
                Object awayGoalsObj = ft.get("away");
                if (homeGoalsObj == null || awayGoalsObj == null) continue;
                int homeGoals = ((Number) homeGoalsObj).intValue();
                int awayGoals = ((Number) awayGoalsObj).intValue();
                Map<String, Object> home = (Map<String, Object>) match.get("homeTeam");
                long hId = ((Number) home.get("id")).longValue();
                boolean isHome = hId == teamId;

                String result;
                if (homeGoals == awayGoals) {
                    result = "D"; draws++;
                } else if ((isHome && homeGoals > awayGoals) || (!isHome && awayGoals > homeGoals)) {
                    result = "W"; wins++;
                } else {
                    result = "L"; losses++;
                }
                results.add(result);
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("teamId", teamId);
            response.put("wins", wins);
            response.put("draws", draws);
            response.put("losses", losses);
            response.put("recentResults", results);
            response.put("recentMatches", recent);
            return response;

        } catch (Exception e) {
            log.error("Error getting form for team {}: {}", teamId, e.getMessage());
            return Map.of("teamId", teamId, "wins", 0, "draws", 0, "losses", 0,
                         "recentResults", List.of(), "recentMatches", List.of());
        }
    }

    public Map<String, Object> predictResult(long homeTeamId, long awayTeamId) {
        try {
            Map<String, Object> homeForm = getTeamForm(homeTeamId);
            Map<String, Object> awayForm = getTeamForm(awayTeamId);

            int homeWins = ((Number) homeForm.getOrDefault("wins", 0)).intValue();
            int homeDraws = ((Number) homeForm.getOrDefault("draws", 0)).intValue();
            int homeLosses = ((Number) homeForm.getOrDefault("losses", 0)).intValue();
            int awayWins = ((Number) awayForm.getOrDefault("wins", 0)).intValue();
            int awayDraws = ((Number) awayForm.getOrDefault("draws", 0)).intValue();
            int awayLosses = ((Number) awayForm.getOrDefault("losses", 0)).intValue();

            int homeTotal = homeWins + homeDraws + homeLosses;
            int awayTotal = awayWins + awayDraws + awayLosses;

            // Win rates (0.0 to 1.0)
            double homeWinRate = homeTotal > 0 ? (double) homeWins / homeTotal : 0.33;
            double homeDrawRate = homeTotal > 0 ? (double) homeDraws / homeTotal : 0.33;
            double awayWinRate = awayTotal > 0 ? (double) awayWins / awayTotal : 0.33;

            // Home advantage boost
            double homeAdv = 0.1;

            // Calculate raw probabilities
            double rawHome = homeWinRate + homeAdv;
            double rawDraw = (homeDrawRate + (awayTotal > 0 ? (double) awayDraws / awayTotal : 0.33)) / 2.0;
            double rawAway = awayWinRate - homeAdv;

            // Ensure non-negative
            rawHome = Math.max(0.05, rawHome);
            rawDraw = Math.max(0.05, rawDraw);
            rawAway = Math.max(0.05, rawAway);

            // Normalize to sum to 1.0
            double total = rawHome + rawDraw + rawAway;
            double homeProb = rawHome / total;
            double drawProb = rawDraw / total;
            double awayProb = rawAway / total;

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("homeTeamId", homeTeamId);
            result.put("awayTeamId", awayTeamId);
            result.put("homeWinProbability", Math.round(homeProb * 100));
            result.put("drawProbability", Math.round(drawProb * 100));
            result.put("awayWinProbability", Math.round(awayProb * 100));
            return result;

        } catch (Exception e) {
            log.error("Prediction error: {}", e.getMessage());
            return Map.of("homeWinProbability", 40, "drawProbability", 25, "awayWinProbability", 35);
        }
    }
}