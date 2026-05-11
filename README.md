# ⚽ Football Analytics Dashboard

Spring Boot backend + React frontend, powered by football-data.org.

---

## Quick Start (5 steps)

### 1. Get your free API key
Go to [football-data.org](https://www.football-data.org/client/register) → register → copy your token.
Free tier: 10 requests/minute, covers PL, La Liga, Bundesliga, Serie A, Ligue 1, MLS.

### 2. Add your key
Edit `src/main/resources/application.yml`:
```yaml
football:
  api:
    api-key: YOUR_KEY_HERE   # ← paste here
```

### 3. Run the backend
```bash
./mvnw spring-boot:run
# Starts on http://localhost:8080
```

### 4. Install and run the frontend
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

### 5. Open the dashboard
http://localhost:5173

---

## API Endpoints

### Module 1 — Live Match Tracker
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Today's matches, all 7 leagues |
| GET | `/api/matches/live` | Only in-play matches |
| GET | `/api/matches/league/{code}` | Single league (e.g. `/league/PL`) |
| GET | `/api/standings/{code}` | League table |

### Module 2 — Player Comparison
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players/search?name=Haaland` | Search players |
| GET | `/api/players/{id}/stats?season=2024` | One player's stats |
| POST | `/api/players/compare` | Compare up to 3 players |

**POST body:**
```json
{ "playerIds": [44, 617, 8004], "season": "2024" }
```

### Module 3 — Form Predictor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/form/team/{id}` | Last 10 results + stats |
| GET | `/api/form/predict?homeTeamId=65&awayTeamId=57` | Win probability |

---

## Key Team IDs (football-data.org)
```
65  → Manchester City       64  → Liverpool FC
57  → Arsenal FC            61  → Chelsea FC
66  → Manchester United     58  → Aston Villa
86  → Real Madrid           81  → Barcelona
5   → Bayern Munich         108 → PSG
```

---

## Project Structure
```
football-dashboard/
├── pom.xml
├── src/main/
│   ├── java/com/football/dashboard/
│   │   ├── FootballDashboardApplication.java
│   │   ├── config/
│   │   │   ├── ApiClientConfig.java    ← WebClient + API key
│   │   │   ├── CacheConfig.java        ← Caffeine TTLs
│   │   │   └── CorsConfig.java         ← Allow React dev server
│   │   ├── controller/
│   │   │   ├── Controllers.java        ← All 3 module REST endpoints
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── service/
│   │   │   ├── MatchService.java       ← Module 1
│   │   │   ├── PlayerService.java      ← Module 2
│   │   │   ├── FormPredictorService.java ← Module 3
│   │   │   └── CacheEvictScheduler.java  ← Auto-refresh
│   │   └── dto/
│   │       └── Dtos.java               ← Response shapes
│   └── resources/
│       └── application.yml
└── frontend/
    └── src/
        └── services/
            └── api.js                  ← React fetch helpers
```

---

## Upgrading from Free → Paid API Tier

The free tier from football-data.org covers the 5 big European leagues well.
For Saudi Pro League, player ratings, and real-time live updates:

- **API-Football (RapidAPI)** — drop-in replacement, same REST style
- Change `football.api.base-url` in `application.yml`
- Update auth header in `ApiClientConfig.java` from `X-Auth-Token` to `x-rapidapi-key`

---

## Scaling: Swap Caffeine for Redis

When you deploy (e.g. to Railway or Render), replace in-memory Caffeine with Redis:

1. Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

2. Update `application.yml`:
```yaml
spring:
  cache:
    type: redis
  data:
    redis:
      host: your-redis-host
      port: 6379
```

That's it — `@Cacheable` annotations stay the same.
