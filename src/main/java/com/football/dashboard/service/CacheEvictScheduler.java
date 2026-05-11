package com.football.dashboard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CacheEvictScheduler {

    private static final Logger log = LoggerFactory.getLogger(CacheEvictScheduler.class);

    @Scheduled(fixedDelay = 60_000)
    @CacheEvict(value = "matches", key = "'live'")
    public void evictLiveMatchCache() {
        log.debug("Evicted live matches cache");
    }

    @Scheduled(fixedDelay = 60_000)
    @CacheEvict(value = "matches", key = "'all-today'")
    public void evictTodayMatchesCache() {
        log.debug("Evicted today's matches cache");
    }

    @Scheduled(fixedDelay = 300_000)
    @CacheEvict(value = "form", allEntries = true)
    public void evictFormCache() {
        log.debug("Evicted form cache");
    }

    @Scheduled(fixedDelay = 300_000)
    @CacheEvict(value = "standings", allEntries = true)
    public void evictStandingsCache() {
        log.debug("Evicted standings cache");
    }
}
