package com.football.dashboard.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleApiError(WebClientResponseException ex) {
        log.error("football-data.org API error: {} {}", ex.getStatusCode(), ex.getMessage());

        String userMessage = switch (ex.getStatusCode().value()) {
            case 400 -> "Invalid request parameters.";
            case 403 -> "API key missing or invalid. Add your key to application.yml.";
            case 404 -> "Resource not found.";
            case 429 -> "Rate limit hit (10 req/min on free tier). Try again shortly.";
            case 500 -> "football-data.org server error. Try again later.";
            default  -> "External API error: " + ex.getStatusCode();
        };

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "status", ex.getStatusCode().value(),
                        "message", userMessage,
                        "timestamp", Instant.now().toString()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", 500,
                        "message", "Internal server error",
                        "timestamp", Instant.now().toString()
                ));
    }
}
