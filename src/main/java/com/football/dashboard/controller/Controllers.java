package com.football.dashboard.controller;

import com.football.dashboard.service.FormPredictorService;
import com.football.dashboard.service.MatchService;
import com.football.dashboard.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 1 — Live Match Tracker
// ═══════════════════════════════════════════════════════════════════════════════

@RestController
@RequestMapping("/api/matches")
class MatchController {

    private final MatchService matchService;

    @Autowired
    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTodaysMatches() {
        return ResponseEntity.ok(matchService.getTodaysMatches());
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getLiveMatches() {
        return ResponseEntity.ok(matchService.getLiveMatches());
    }

    @GetMapping("/league/{code}")
    public ResponseEntity<Map<String, Object>> getByLeague(@PathVariable String code) {
        return ResponseEntity.ok(matchService.getMatchesByLeague(code.toUpperCase()));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 1b — Standings
// ═══════════════════════════════════════════════════════════════════════════════

@RestController
@RequestMapping("/api/standings")
class StandingsController {

    private final MatchService matchService;

    @Autowired
    public StandingsController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/{code}")
    public ResponseEntity<Map<String, Object>> getStandings(@PathVariable String code) {
        return ResponseEntity.ok(matchService.getStandings(code.toUpperCase()));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 2 — Player Comparison Engine
// ═══════════════════════════════════════════════════════════════════════════════

@RestController
@RequestMapping("/api/players")
class PlayerController {

    private final PlayerService playerService;

    @Autowired
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchPlayers(@RequestParam String name) {
        return ResponseEntity.ok(playerService.searchPlayers(name));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getPlayerStats(
            @PathVariable Long id,
            @RequestParam(required = false) String season) {
        return ResponseEntity.ok(playerService.getPlayerStats(id, season));
    }

    @PostMapping("/compare")
    public ResponseEntity<List<Map<String, Object>>> comparePlayers(
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Integer> rawIds = (List<Integer>) body.get("playerIds");
        List<Long> playerIds = rawIds.stream().map(Integer::longValue).toList();
        String season = (String) body.get("season");
        return ResponseEntity.ok(playerService.comparePlayers(playerIds, season));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 3 — Team Form Predictor
// ═══════════════════════════════════════════════════════════════════════════════

@RestController
@RequestMapping("/api/form")
class FormController {

    private final FormPredictorService formPredictorService;

    @Autowired
    public FormController(FormPredictorService formPredictorService) {
        this.formPredictorService = formPredictorService;
    }

    @GetMapping("/team/{id}")
    public ResponseEntity<Map<String, Object>> getTeamForm(@PathVariable Long id) {
        return ResponseEntity.ok(formPredictorService.getTeamForm(id));
    }

    @GetMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictMatch(
            @RequestParam Long homeTeamId,
            @RequestParam Long awayTeamId) {
        return ResponseEntity.ok(formPredictorService.predictResult(homeTeamId, awayTeamId));
    }
}
