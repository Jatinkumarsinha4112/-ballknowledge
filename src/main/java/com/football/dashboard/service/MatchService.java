package com.football.dashboard.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.X509Certificate;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MatchService {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    @Value("${football.api.api-key}")
    private String apiKey;

    private static final String BASE = "https://api.football-data.org/v4";

    static {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(X509Certificate[] c, String a) {}
                    public void checkServerTrusted(X509Certificate[] c, String a) {}
                }
            };
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAll, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((h, s) -> true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String get(String path) throws Exception {
        URL url = new URL(BASE + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("X-Auth-Token", apiKey);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }

    @Cacheable(value = "matches", key = "#leagueCode")
    public Map<String, Object> getMatchesByLeague(String leagueCode) {
        log.debug("Fetching matches for league: {}", leagueCode);
        try {
            String raw = get("/competitions/" + leagueCode + "/matches");
            return mapper.readValue(raw, Map.class);
        } catch (Exception e) {
            log.error("Failed: {}", e.getMessage());
            return Map.of("matches", List.of(), "error", e.getMessage());
        }
    }

    @Cacheable(value = "matches", key = "'all-today'")
    public Map<String, Object> getTodaysMatches() {
        try {
            String raw = get("/matches?competitions=PL,PD,BL1,SA,FL1");
            return mapper.readValue(raw, Map.class);
        } catch (Exception e) {
            return Map.of("matches", List.of(), "error", e.getMessage());
        }
    }

    @Cacheable(value = "matches", key = "'live'")
    public Map<String, Object> getLiveMatches() {
        try {
            String raw = get("/matches?status=IN_PLAY,PAUSED");
            return mapper.readValue(raw, Map.class);
        } catch (Exception e) {
            return Map.of("matches", List.of());
        }
    }

    @Cacheable(value = "standings", key = "#leagueCode")
    public Map<String, Object> getStandings(String leagueCode) {
        try {
            String raw = get("/competitions/" + leagueCode + "/standings");
            return mapper.readValue(raw, Map.class);
        } catch (Exception e) {
            log.error("Failed standings for {}: {}", leagueCode, e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}