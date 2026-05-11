package com.football.dashboard.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    /**
     * Named caches with individual TTLs:
     *  - "matches"   → 60s  (live scores, refresh fast)
     *  - "standings" → 5min
     *  - "player"    → 1hr  (stats don't change mid-match)
     *  - "form"      → 5min
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();

        // Default spec (fallback)
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(60, TimeUnit.SECONDS));

        return manager;
    }

    @Bean("matchesCaffeine")
    public com.github.benmanes.caffeine.cache.Cache<Object, Object> matchesCache() {
        return Caffeine.newBuilder()
                .maximumSize(50)
                .expireAfterWrite(60, TimeUnit.SECONDS)
                .build();
    }

    @Bean("standingsCaffeine")
    public com.github.benmanes.caffeine.cache.Cache<Object, Object> standingsCache() {
        return Caffeine.newBuilder()
                .maximumSize(20)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build();
    }

    @Bean("playerCaffeine")
    public com.github.benmanes.caffeine.cache.Cache<Object, Object> playerCache() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    @Bean("formCaffeine")
    public com.github.benmanes.caffeine.cache.Cache<Object, Object> formCache() {
        return Caffeine.newBuilder()
                .maximumSize(50)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build();
    }
}
