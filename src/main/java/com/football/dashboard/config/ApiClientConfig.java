package com.football.dashboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class ApiClientConfig {

    @Value("${football.api.base-url}")
    private String baseUrl;

    @Value("${football.api.api-key}")
    private String apiKey;

    /**
     * Pre-configured WebClient for football-data.org.
     * The X-Auth-Token header is added to every request automatically.
     */
    @Bean
    public WebClient footballApiClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Auth-Token", apiKey)
                .build();
    }
}
