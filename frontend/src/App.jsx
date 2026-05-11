import { useState, useEffect } from "react";

const API = "http://localhost:8080/api";

const LEAGUES = [
  { code: "PL", name: "PREMIER LEAGUE" },
  { code: "PD", name: "LA LIGA" },
  { code: "BL1", name: "BUNDESLIGA" },
  { code: "SA", name: "SERIE A" },
  { code: "FL1", name: "LIGUE 1" },
];

const ALL_TEAMS = [
  // Premier League
  { id: 64, name: "Liverpool" }, { id: 57, name: "Arsenal" },
  { id: 65, name: "Man City" }, { id: 61, name: "Chelsea" },
  { id: 66, name: "Man United" }, { id: 58, name: "Aston Villa" },
  { id: 73, name: "Tottenham" }, { id: 67, name: "Newcastle" },
  { id: 351, name: "Nottm Forest" }, { id: 397, name: "Brighton" },
  { id: 63, name: "Fulham" }, { id: 402, name: "Brentford" },
  { id: 328, name: "Burnley" }, { id: 354, name: "Crystal Palace" },
  { id: 62, name: "Everton" }, { id: 341, name: "Leeds" },
  { id: 71, name: "Sunderland" }, { id: 76, name: "Wolves" },
  { id: 563, name: "West Ham" }, { id: 1044, name: "Bournemouth" },
  // La Liga
  { id: 86, name: "Real Madrid" }, { id: 81, name: "Barcelona" },
  { id: 78, name: "Atletico Madrid" }, { id: 90, name: "Real Betis" },
  { id: 77, name: "Athletic Club" }, { id: 559, name: "Sevilla" },
  { id: 558, name: "Celta Vigo" }, { id: 82, name: "Getafe" },
  // Bundesliga
  { id: 5, name: "Bayern Munich" }, { id: 4, name: "Borussia Dortmund" },
  { id: 3, name: "Bayer Leverkusen" }, { id: 11, name: "RB Leipzig" },
  { id: 6, name: "Frankfurt" }, { id: 7, name: "Wolfsburg" },
  // Serie A
  { id: 108, name: "Inter Milan" }, { id: 98, name: "AC Milan" },
  { id: 115, name: "Juventus" }, { id: 100, name: "AS Roma" },
  { id: 99, name: "Napoli" }, { id: 107, name: "Atalanta" },
  // Ligue 1
  { id: 524, name: "PSG" }, { id: 516, name: "Monaco" },
  { id: 511, name: "Marseille" }, { id: 521, name: "Rennes" },
  { id: 532, name: "Lens" }, { id: 519, name: "Nice" },
].sort((a, b) => a.name.localeCompare(b.name));

const S = {
  navFont: 13,
  brandFont: 20,
  subFont: 10,
  headingFont: 72,
  labelFont: 11,
  bodyFont: 15,
  scoreFont: 22,
  teamFont: 16,
  statBigFont: 42,
  probFont: 46,
  tableRowFont: 14,
  tableHeaderFont: 11,
  dotSize: 32,
  logoMd: 32,
  logoSm: 26,
  logoXs: 24,
  btnPadV: 10,
  btnPadH: 24,
  rowPad: "16px 28px",
  maxWidth: 1320,
};

function TeamLogo({ crest, name, size = 32 }) {
  const [err, setErr] = useState(false);
  if (!crest || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(240,240,250,0.08)", border: "1px solid rgba(240,240,250,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, color: "#f0f0fa", fontWeight: 700, flexShrink: 0,
      }}>
        {name?.[0] || "?"}
      </div>
    );
  }
  return (
    <img src={crest} alt={name} width={size} height={size}
      style={{ objectFit: "contain", flexShrink: 0 }}
      onError={() => setErr(true)} />
  );
}

function LeagueButtons({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
      {LEAGUES.map(l => (
        <button key={l.code} onClick={() => onChange(l.code)} style={{
          background: value === l.code ? "rgba(240,240,250,0.14)" : "rgba(240,240,250,0.03)",
          border: `1px solid ${value === l.code ? "rgba(240,240,250,0.5)" : "rgba(240,240,250,0.14)"}`,
          color: "#f0f0fa", padding: `${S.btnPadV}px ${S.btnPadH}px`,
          borderRadius: 32, cursor: "pointer",
          fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase",
        }}>{l.name}</button>
      ))}
    </div>
  );
}

function MatchCard({ match }) {
  const home = match.homeTeam;
  const away = match.awayTeam;
  const score = match.score?.fullTime;
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const date = new Date(match.utcDate);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: S.rowPad, marginBottom: 3,
      background: isLive ? "rgba(240,240,250,0.055)" : "rgba(240,240,250,0.018)",
      borderLeft: isLive ? "3px solid #f0f0fa" : "3px solid transparent",
      transition: "background 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(240,240,250,0.045)"}
      onMouseLeave={e => e.currentTarget.style.background = isLive ? "rgba(240,240,250,0.055)" : "rgba(240,240,250,0.018)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "38%", justifyContent: "flex-end" }}>
        <span style={{ color: "#f0f0fa", fontSize: S.teamFont, letterSpacing: "0.8px", textTransform: "uppercase", textAlign: "right" }}>
          {home?.shortName || home?.name}
        </span>
        <TeamLogo crest={home?.crest} name={home?.shortName} size={S.logoSm} />
      </div>

      <div style={{ textAlign: "center", width: "24%", padding: "0 10px" }}>
        {isFinished || isLive ? (
          <div>
            <span style={{ fontSize: S.scoreFont, fontWeight: 700, color: "#f0f0fa", letterSpacing: "4px", fontFamily: "monospace" }}>
              {score?.home ?? 0} — {score?.away ?? 0}
            </span>
            <div style={{ fontSize: 10, letterSpacing: "1.17px", textTransform: "uppercase", marginTop: 3,
              color: isLive ? "#f0f0fa" : "rgba(240,240,250,0.3)" }}>
              {isLive ? "● LIVE" : "FT"}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: S.bodyFont, color: "#f0f0fa", letterSpacing: "1px" }}>{timeStr}</div>
            <div style={{ fontSize: 10, color: "rgba(240,240,250,0.35)", letterSpacing: "1px", textTransform: "uppercase" }}>{dateStr}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "38%" }}>
        <TeamLogo crest={away?.crest} name={away?.shortName} size={S.logoSm} />
        <span style={{ color: "#f0f0fa", fontSize: S.teamFont, letterSpacing: "0.8px", textTransform: "uppercase" }}>
          {away?.shortName || away?.name}
        </span>
      </div>
    </div>
  );
}

function MatchesModule() {
  const [league, setLeague] = useState("PL");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/matches/league/${league}`)
      .then(r => r.json())
      .then(d => { setMatches(d.matches || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [league]);

  const filtered = matches.filter(m => {
    if (filter === "LIVE") return m.status === "IN_PLAY" || m.status === "PAUSED";
    if (filter === "FINISHED") return m.status === "FINISHED";
    if (filter === "UPCOMING") return m.status === "TIMED" || m.status === "SCHEDULED";
    return true;
  });

  const grouped = filtered.reduce((acc, m) => {
    const md = `MATCHDAY ${m.matchday}`;
    if (!acc[md]) acc[md] = [];
    acc[md].push(m);
    return acc;
  }, {});

  return (
    <div>
      <LeagueButtons value={league} onChange={setLeague} />
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {["ALL", "LIVE", "FINISHED", "UPCOMING"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "rgba(240,240,250,0.09)" : "transparent",
            border: "1px solid rgba(240,240,250,0.14)",
            color: filter === f ? "#f0f0fa" : "rgba(240,240,250,0.38)",
            padding: "7px 18px", borderRadius: 32, cursor: "pointer",
            fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase",
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "rgba(240,240,250,0.3)", padding: 56, letterSpacing: "1px", fontSize: S.labelFont, textTransform: "uppercase" }}>
          LOADING FIXTURES...
        </div>
      ) : (
        Object.entries(grouped).slice(-6).reverse().map(([md, mdMatches]) => (
          <div key={md} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase",
              color: "rgba(240,240,250,0.3)", marginBottom: 10, paddingLeft: 28 }}>{md}</div>
            {mdMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ))
      )}
    </div>
  );
}

function StandingsModule() {
  const [league, setLeague] = useState("PL");
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/standings/${league}`)
      .then(r => r.json())
      .then(d => {
        const table = d.standings?.find(s => s.type === "TOTAL");
        setStandings(table?.table || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [league]);

  const cols = "48px 1fr 68px 68px 68px 68px 76px 88px";

  return (
    <div>
      <LeagueButtons value={league} onChange={setLeague} />
      {loading ? (
        <div style={{ textAlign: "center", color: "rgba(240,240,250,0.3)", padding: 56, letterSpacing: "1px", fontSize: S.labelFont, textTransform: "uppercase" }}>
          LOADING TABLE...
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: cols,
            padding: "10px 24px", fontSize: S.tableHeaderFont, letterSpacing: "1.17px", textTransform: "uppercase",
            color: "rgba(240,240,250,0.3)", borderBottom: "1px solid rgba(240,240,250,0.07)", marginBottom: 6 }}>
            <span>#</span><span>CLUB</span>
            <span style={{ textAlign: "center" }}>MP</span>
            <span style={{ textAlign: "center" }}>W</span>
            <span style={{ textAlign: "center" }}>D</span>
            <span style={{ textAlign: "center" }}>L</span>
            <span style={{ textAlign: "center" }}>GD</span>
            <span style={{ textAlign: "center" }}>PTS</span>
          </div>
          {standings.map((row, i) => (
            <div key={row.team.id} style={{
              display: "grid", gridTemplateColumns: cols,
              padding: "14px 24px", fontSize: S.tableRowFont, color: "#f0f0fa", marginBottom: 2,
              background: i < 4 ? "rgba(240,240,250,0.028)" : "transparent",
              borderLeft: i < 4 ? "3px solid rgba(240,240,250,0.45)"
                : i < 6 ? "3px solid rgba(240,240,250,0.15)"
                : "3px solid transparent",
            }}>
              <span style={{ color: "rgba(240,240,250,0.35)", fontSize: S.tableRowFont }}>{row.position}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <TeamLogo crest={row.team.crest} name={row.team.shortName} size={S.logoXs} />
                <span style={{ letterSpacing: "0.6px", textTransform: "uppercase", fontSize: S.tableRowFont }}>
                  {row.team.shortName || row.team.name}
                </span>
              </div>
              <span style={{ textAlign: "center", color: "rgba(240,240,250,0.5)" }}>{row.playedGames}</span>
              <span style={{ textAlign: "center" }}>{row.won}</span>
              <span style={{ textAlign: "center", color: "rgba(240,240,250,0.5)" }}>{row.draw}</span>
              <span style={{ textAlign: "center", color: "rgba(240,240,250,0.35)" }}>{row.lost}</span>
              <span style={{ textAlign: "center", color: row.goalDifference > 0 ? "#f0f0fa" : "rgba(240,240,250,0.4)" }}>
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </span>
              <span style={{ textAlign: "center", fontWeight: 700, fontFamily: "monospace", fontSize: S.tableRowFont + 3 }}>{row.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultDot({ result }) {
  const bg = result === "W" ? "#f0f0fa" : result === "D" ? "rgba(240,240,250,0.35)" : "rgba(240,240,250,0.1)";
  const color = result === "W" ? "#000" : "#f0f0fa";
  return (
    <div title={result} style={{
      width: S.dotSize, height: S.dotSize, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, letterSpacing: "0.5px", color, fontWeight: 700, flexShrink: 0,
    }}>{result}</div>
  );
}

function FormModule() {
  const [homeId, setHomeId] = useState(57);  // Arsenal
  const [awayId, setAwayId] = useState(81);  // Barcelona
  const [homeForm, setHomeForm] = useState(null);
  const [awayForm, setAwayForm] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setHomeForm(null); setAwayForm(null); setPrediction(null);
    Promise.all([
      fetch(`${API}/form/team/${homeId}`).then(r => r.json()).catch(() => null),
      fetch(`${API}/form/team/${awayId}`).then(r => r.json()).catch(() => null),
      fetch(`${API}/form/predict?homeTeamId=${homeId}&awayTeamId=${awayId}`).then(r => r.json()).catch(() => null),
    ]).then(([h, a, p]) => { setHomeForm(h); setAwayForm(a); setPrediction(p); setLoading(false); });
  }, [homeId, awayId]);

  const homeTeam = ALL_TEAMS.find(t => t.id === homeId);
  const awayTeam = ALL_TEAMS.find(t => t.id === awayId);

  const normProb = (val) => {
    if (val == null) return 33;
    const n = Number(val);
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
  };
  const rawHome = normProb(prediction?.homeWinProbability);
  const rawDraw = normProb(prediction?.drawProbability);
  const rawAway = normProb(prediction?.awayWinProbability);
  const total = rawHome + rawDraw + rawAway || 100;
  const hP = Math.round((rawHome / total) * 100);
  const dP = Math.round((rawDraw / total) * 100);
  const aP = 100 - hP - dP;

  const selectStyle = {
    width: "100%", background: "rgba(240,240,250,0.04)",
    border: "1px solid rgba(240,240,250,0.15)", color: "#f0f0fa",
    padding: "13px 16px", borderRadius: 6, fontSize: S.bodyFont,
    letterSpacing: "0.8px", textTransform: "uppercase", cursor: "pointer", outline: "none",
  };

  return (
    <div>
      {/* Team selectors — no league picker */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase", color: "rgba(240,240,250,0.35)", marginBottom: 10 }}>
            HOME TEAM
          </div>
          <select value={homeId} onChange={e => setHomeId(Number(e.target.value))} style={selectStyle}>
            {ALL_TEAMS.map(t => (
              <option key={t.id} value={t.id} style={{ background: "#111" }}>{t.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: 20, color: "rgba(240,240,250,0.25)", paddingBottom: 14, letterSpacing: "3px" }}>VS</div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase", color: "rgba(240,240,250,0.35)", marginBottom: 10 }}>
            AWAY TEAM
          </div>
          <select value={awayId} onChange={e => setAwayId(Number(e.target.value))} style={selectStyle}>
            {ALL_TEAMS.map(t => (
              <option key={t.id} value={t.id} style={{ background: "#111" }}>{t.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "rgba(240,240,250,0.3)", padding: 56, letterSpacing: "1px", fontSize: S.labelFont, textTransform: "uppercase" }}>
          ANALYZING FORM DATA...
        </div>
      ) : (
        <>
          {/* Win probability box */}
          <div style={{ marginBottom: 28, padding: "32px 36px", background: "rgba(240,240,250,0.02)", border: "1px solid rgba(240,240,250,0.07)" }}>
            <div style={{ fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase", color: "rgba(240,240,250,0.35)", marginBottom: 24, textAlign: "center" }}>
              WIN PROBABILITY
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              {[
                { pct: hP, label: homeTeam?.name || "HOME", opacity: 1 },
                { pct: dP, label: "DRAW", opacity: 0.45 },
                { pct: aP, label: awayTeam?.name || "AWAY", opacity: 0.7 },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: S.probFont, fontWeight: 700, fontFamily: "monospace", lineHeight: 1,
                    color: `rgba(240,240,250,${item.opacity})` }}>{item.pct}%</div>
                  <div style={{ fontSize: S.labelFont, letterSpacing: "1px", textTransform: "uppercase",
                    color: "rgba(240,240,250,0.3)", marginTop: 8 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 6, display: "flex", borderRadius: 3, overflow: "hidden", gap: 1 }}>
              <div style={{ width: `${hP}%`, background: "#f0f0fa", transition: "width 0.8s ease" }} />
              <div style={{ width: `${dP}%`, background: "rgba(240,240,250,0.3)", transition: "width 0.8s ease" }} />
              <div style={{ width: `${aP}%`, background: "rgba(240,240,250,0.12)", transition: "width 0.8s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(240,240,250,0.18)" }}>
              <span>HOME WIN</span><span>DRAW</span><span>AWAY WIN</span>
            </div>
          </div>

          {/* Form cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[{ form: homeForm, team: homeTeam }, { form: awayForm, team: awayTeam }].map(({ form, team }, idx) => (
              <div key={idx} style={{ padding: "26px 28px", background: "rgba(240,240,250,0.02)", border: "1px solid rgba(240,240,250,0.07)" }}>
                <div style={{ fontSize: S.bodyFont, letterSpacing: "1.17px", textTransform: "uppercase", color: "#f0f0fa", fontWeight: 700, marginBottom: 22 }}>
                  {team?.name || (idx === 0 ? "HOME" : "AWAY")}
                </div>

                <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid rgba(240,240,250,0.07)", paddingBottom: 20 }}>
                  {[
                    { label: "WINS", val: form?.wins ?? "—", op: 1 },
                    { label: "DRAWS", val: form?.draws ?? "—", op: 0.5 },
                    { label: "LOSSES", val: form?.losses ?? "—", op: 0.3 },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: S.statBigFont, fontWeight: 700, fontFamily: "monospace", lineHeight: 1, color: `rgba(240,240,250,${s.op})` }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(240,240,250,0.25)", marginTop: 7 }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {form?.recentResults?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(240,240,250,0.3)", marginBottom: 12 }}>
                      LAST {form.recentResults.length} RESULTS
                    </div>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {form.recentResults.map((r, j) => <ResultDot key={j} result={r} />)}
                    </div>
                  </div>
                )}

                {form?.recentMatches?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(240,240,250,0.3)", marginBottom: 12 }}>
                      RECENT MATCHES
                    </div>
                    {form.recentMatches.slice(0, 5).map((m, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 0", borderBottom: "1px solid rgba(240,240,250,0.04)" }}>
                        <span style={{ fontSize: S.bodyFont - 2, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(240,240,250,0.55)" }}>
                          {m.homeTeam?.shortName || m.homeTeam?.name} vs {m.awayTeam?.shortName || m.awayTeam?.name}
                        </span>
                        <span style={{ fontFamily: "monospace", color: "#f0f0fa", fontSize: S.bodyFont, fontWeight: 700 }}>
                          {m.score?.fullTime?.home}–{m.score?.fullTime?.away}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!form && (
                  <div style={{ fontSize: S.labelFont, color: "rgba(240,240,250,0.2)", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center", padding: "24px 0" }}>
                    NO DATA AVAILABLE
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("MATCHES");

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#f0f0fa", fontFamily: "'Arial Narrow', Arial, sans-serif" }}>
      {/* Header */}
      <div style={{
        padding: "22px 56px", borderBottom: "1px solid rgba(240,240,250,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "rgba(0,0,0,0.97)", backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>⚽</span>
          <div>
            <div style={{ fontSize: S.brandFont, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#f0f0fa", lineHeight: 1 }}>
              BALL<span style={{ color: "rgba(240,240,250,0.42)" }}>KNOWLEDGE</span>
            </div>
            <div style={{ fontSize: S.subFont, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(240,240,250,0.2)", marginTop: 3 }}>
              FOOTBALL ANALYTICS
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["MATCHES", "STANDINGS", "FORM"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "rgba(240,240,250,0.1)" : "transparent",
              border: `1px solid ${tab === t ? "rgba(240,240,250,0.35)" : "transparent"}`,
              color: tab === t ? "#f0f0fa" : "rgba(240,240,250,0.4)",
              padding: "10px 26px", borderRadius: 32, cursor: "pointer",
              fontSize: S.navFont, letterSpacing: "1.17px", textTransform: "uppercase", transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = "rgba(240,240,250,0.75)"; }}
              onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = "rgba(240,240,250,0.4)"; }}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: S.maxWidth, margin: "0 auto", padding: "44px 40px" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: S.headingFont, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#f0f0fa", margin: 0, lineHeight: 1 }}>
            {tab === "MATCHES" && "LIVE MATCHES"}
            {tab === "STANDINGS" && "LEAGUE TABLE"}
            {tab === "FORM" && "FORM PREDICTOR"}
          </h1>
          <div style={{ width: 60, height: 3, background: "#f0f0fa", marginTop: 18 }} />
        </div>

        {tab === "MATCHES" && <MatchesModule />}
        {tab === "STANDINGS" && <StandingsModule />}
        {tab === "FORM" && <FormModule />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(240,240,250,0.06)", padding: "24px 56px", marginTop: 56, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: S.labelFont, letterSpacing: "1.17px", textTransform: "uppercase", color: "rgba(240,240,250,0.18)" }}>
          © BALLKNOWLEDGE — FOOTBALL ANALYTICS
        </span>
        <span style={{ fontSize: S.labelFont, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(240,240,250,0.12)" }}>
          POWERED BY FOOTBALL-DATA.ORG
        </span>
      </div>
    </div>
  );
}