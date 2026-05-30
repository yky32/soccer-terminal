import type { NewsArticle } from "@/lib/data/news-article";

function unsplash(photoId: string) {
  return `https://images.unsplash.com/${photoId}?w=900&auto=format&fit=crop&q=80`;
}

const LEAGUE = {
  epl: "https://media.api-sports.io/football/leagues/39.png",
  laliga: "https://media.api-sports.io/football/leagues/140.png",
  serieA: "https://media.api-sports.io/football/leagues/135.png",
  bundesliga: "https://media.api-sports.io/football/leagues/78.png",
  mls: "https://media.api-sports.io/football/leagues/253.png",
  j1: "https://media.api-sports.io/football/leagues/98.png",
  kLeague: "https://media.api-sports.io/football/leagues/292.png",
  saudiPro: "https://media.api-sports.io/football/leagues/307.png",
  csl: "https://media.api-sports.io/football/leagues/169.png",
  nswNpl: "https://media.api-sports.io/football/leagues/192.png",
  ligue1: "https://media.api-sports.io/football/leagues/61.png",
  ucl: "https://media.api-sports.io/football/leagues/2.png",
  uel: "https://media.api-sports.io/football/leagues/3.png",
  eredivisie: "https://media.api-sports.io/football/leagues/88.png",
  ligaPortugal: "https://media.api-sports.io/football/leagues/94.png",
};

const IMG = {
  stadium: unsplash("photo-1431324155629-1a6deb1dec8d"),
  action: unsplash("photo-1529900748604-07564a03e7a6"),
  crowd: unsplash("photo-1522778119026-d647f0596c20"),
  training: unsplash("photo-1517466787929-bc90951d0974"),
  boots: unsplash("photo-1560272564-c83b66b1ad12"),
  night: unsplash("photo-1459865264687-595d652de67e"),
  pitch: unsplash("photo-1461896836934-ffe607ba8211"),
  asia: unsplash("photo-1579952363873-27f3bade9f55"),
  transfer: unsplash("photo-1552674605-db6ffd4facb5"),
  tunnel: unsplash("photo-1547347298-4074fc3086f0"),
};

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-001",
    headline: "Arsenal agree framework for €48m midfield signing ahead of pre-season tour",
    excerpt:
      "Sources close to the deal say personal terms are settled and medical clearance is expected within 48 hours. The move would strengthen Arteta's rotation in central areas.",
    publishedAt: hoursAgo(1.2),
    category: "transfer",
    league: "Premier League",
    leagueLogo: LEAGUE.epl,
    imageUrl: IMG.transfer,
    imageAlt: "Football transfer negotiations",
    featured: true,
    body:
      "Sources close to the deal say personal terms are settled and medical clearance is expected within 48 hours. The move would strengthen Arteta's rotation in central areas.\n\nArsenal have pursued a dynamic No. 8 for two windows and view this signing as the final piece in a midfield rebuild that already brought incremental depth. Rivals remain interested, but the player is said to favor a Premier League move.\n\nAn official announcement could arrive before the pre-season tour unless late medical checks delay the timeline.",
  },
  {
    id: "news-002",
    headline: "Real Madrid edge Barcelona in El Clásico thriller as late strike seals three points",
    excerpt:
      "A frantic second half at the Bernabéu swung on a 78th-minute counter. Both managers pointed to defensive lapses in transition as the decisive factor.",
    publishedAt: hoursAgo(3.5),
    category: "match-report",
    league: "La Liga",
    leagueLogo: LEAGUE.laliga,
    imageUrl: IMG.action,
    imageAlt: "Players competing for the ball",
  },
  {
    id: "news-003",
    headline: "Inter Milan confirm star striker will miss three weeks with hamstring strain",
    excerpt:
      "Scans after Sunday's fixture ruled out a quick return. Inzaghi says the club will not rush rehabilitation with a congested fixture list approaching.",
    publishedAt: hoursAgo(5),
    category: "injury",
    league: "Serie A",
    leagueLogo: LEAGUE.serieA,
    imageUrl: IMG.training,
    imageAlt: "Player receiving treatment during training",
  },
  {
    id: "news-004",
    headline: "Bayern Munich's xG surge offers blueprint for next week's title decider",
    excerpt:
      "Data from the last five league matches shows improved wide overloads and higher box entries. Analysts expect Leverkusen to sit deeper in response.",
    publishedAt: hoursAgo(7.5),
    category: "analysis",
    league: "Bundesliga",
    leagueLogo: LEAGUE.bundesliga,
    imageUrl: IMG.pitch,
    imageAlt: "Tactical view of a football pitch",
  },
  {
    id: "news-005",
    headline: "LAFC vs Galaxy preview: Pacific rivalry set for highest attendance of the season",
    excerpt:
      "Form guides point to an open game with both sides ranking top three for shots in the last month. Weather and travel fatigue could tilt the bench battle.",
    publishedAt: hoursAgo(9),
    category: "preview",
    league: "MLS",
    leagueLogo: LEAGUE.mls,
    imageUrl: IMG.crowd,
    imageAlt: "Fans in a packed stadium",
  },
  {
    id: "news-006",
    headline: "Urawa Red Diamonds appoint interim coach after sudden resignation",
    excerpt:
      "The J1 club moved quickly to stabilize the dressing room with six league matches before the summer break. Academy director will assist until a permanent hire.",
    publishedAt: hoursAgo(11),
    category: "analysis",
    league: "J1 League",
    leagueLogo: LEAGUE.j1,
    imageUrl: IMG.asia,
    imageAlt: "Japanese football stadium atmosphere",
  },
  {
    id: "news-007",
    headline: "Ulsan HD close to loan extension for creative midfielder amid European interest",
    excerpt:
      "K League sources say a buy option is included if the player hits appearance thresholds. European scouts attended the last two domestic fixtures.",
    publishedAt: hoursAgo(14),
    category: "transfer",
    league: "K League 1",
    leagueLogo: LEAGUE.kLeague,
    imageUrl: IMG.boots,
    imageAlt: "Football boots on pitch",
  },
  {
    id: "news-008",
    headline: "Al-Nassr's four-goal response signals intent in Saudi Pro League title race",
    excerpt:
      "A dominant second-half performance lifted them within two points of the summit. Set-piece efficiency and direct running were the recurring themes post-match.",
    publishedAt: hoursAgo(18),
    category: "match-report",
    league: "Pro League",
    leagueLogo: LEAGUE.saudiPro,
    imageUrl: IMG.night,
    imageAlt: "Night match under floodlights",
  },
  {
    id: "news-009",
    headline: "Shanghai Port monitoring Beijing Guoan defender as CSL transfer window nears",
    excerpt:
      "Negotiations remain early-stage but both clubs have held exploratory talks. A domestic-record fee has not been ruled out if the player pushes for the move.",
    publishedAt: hoursAgo(22),
    category: "transfer",
    league: "Super League",
    leagueLogo: LEAGUE.csl,
    imageUrl: IMG.stadium,
    imageAlt: "Modern football stadium exterior",
  },
  {
    id: "news-010",
    headline: "NSW NPL leaders extend unbeaten run with disciplined away performance",
    excerpt:
      "A second-half penalty proved the difference in a tight contest. Coaches highlighted improved rest-defense and lower turnover rate in the final third.",
    publishedAt: hoursAgo(26),
    category: "match-report",
    league: "NSW NPL",
    leagueLogo: LEAGUE.nswNpl,
    imageUrl: IMG.action,
    imageAlt: "Local league match action",
  },
  {
    id: "news-011",
    headline: "Premier League clubs vote on expanded winter break schedule for 2026–27",
    excerpt:
      "The proposal would add a synchronized pause in February to align with European calendars. Smaller clubs raised concerns over revenue and squad depth.",
    publishedAt: hoursAgo(30),
    category: "analysis",
    league: "Premier League",
    leagueLogo: LEAGUE.epl,
    imageUrl: IMG.stadium,
    imageAlt: "Premier League stadium panorama",
  },
  {
    id: "news-012",
    headline: "Serie A weekend preview: Top-four clash could reshape Champions League race",
    excerpt:
      "Injury returns and suspension clear-outs set up the most balanced matchup of the round. Both managers emphasized controlling half-space in press triggers.",
    publishedAt: hoursAgo(36),
    category: "preview",
    league: "Serie A",
    leagueLogo: LEAGUE.serieA,
    imageUrl: IMG.crowd,
    imageAlt: "Serie A supporters before kickoff",
  },
  {
    id: "news-013",
    headline: "Chelsea target Serie A wing-back as Maresca reshapes wide rotations",
    excerpt:
      "Recruitment talks have accelerated after a string of narrow defensive phases. The club is prioritizing a player comfortable inverted on either flank.",
    publishedAt: hoursAgo(40),
    category: "transfer",
    league: "Premier League",
    leagueLogo: LEAGUE.epl,
    imageUrl: IMG.transfer,
    imageAlt: "Player training during transfer window",
  },
  {
    id: "news-014",
    headline: "Liverpool midfielder set for scan after pulling up in Thursday session",
    excerpt:
      "Klopp's staff are cautiously optimistic but will know more after imaging. The timing is awkward with a European tie less than ten days away.",
    publishedAt: hoursAgo(44),
    category: "injury",
    league: "Premier League",
    leagueLogo: LEAGUE.epl,
    imageUrl: IMG.training,
    imageAlt: "Medical staff attending to a player",
  },
  {
    id: "news-015",
    headline: "Dortmund's high press flattens rivals in statement home win",
    excerpt:
      "Three first-half turnovers led to two goals and a sustained territorial edge. Post-match data showed the fastest average recovery time this season.",
    publishedAt: hoursAgo(48),
    category: "match-report",
    league: "Bundesliga",
    leagueLogo: LEAGUE.bundesliga,
    imageUrl: IMG.action,
    imageAlt: "Bundesliga match under floodlights",
  },
  {
    id: "news-016",
    headline: "Leverkusen coach praises squad depth ahead of Bayern Munich showdown",
    excerpt:
      "Rotation in wide areas kept legs fresh during a congested April schedule. Analysts expect a tighter mid-block than the reverse fixture.",
    publishedAt: hoursAgo(52),
    category: "preview",
    league: "Bundesliga",
    leagueLogo: LEAGUE.bundesliga,
    imageUrl: IMG.pitch,
    imageAlt: "Bundesliga tactical session",
  },
  {
    id: "news-017",
    headline: "Barcelona academy graduate agrees new contract through 2030",
    excerpt:
      "The deal includes a substantial release clause and first-team minutes guarantees next season. Flick highlighted his pressing profile in media duties.",
    publishedAt: hoursAgo(56),
    category: "transfer",
    league: "La Liga",
    leagueLogo: LEAGUE.laliga,
    imageUrl: IMG.stadium,
    imageAlt: "Camp Nou exterior at dusk",
  },
  {
    id: "news-018",
    headline: "Real Madrid winger returns to full training after ankle knock",
    excerpt:
      "Club medics cleared him for contact work earlier than projected. Ancelotti stopped short of confirming availability for the weekend fixture.",
    publishedAt: hoursAgo(60),
    category: "injury",
    league: "La Liga",
    leagueLogo: LEAGUE.laliga,
    imageUrl: IMG.training,
    imageAlt: "Real Madrid training ground session",
  },
  {
    id: "news-019",
    headline: "Inter Milan close in on loan deal for Premier League centre-back",
    excerpt:
      "Personal terms are agreed and club-to-club talks are in the final stages. The move would add cover with the Coppa Italia run still alive.",
    publishedAt: hoursAgo(64),
    category: "transfer",
    league: "Serie A",
    leagueLogo: LEAGUE.serieA,
    imageUrl: IMG.transfer,
    imageAlt: "Contract signing table setup",
  },
  {
    id: "news-020",
    headline: "LAFC sign homegrown forward to long-term extension",
    excerpt:
      "The club cited his pressing output and link play as core to the next tactical cycle. Galaxy rivals are expected to respond in the market.",
    publishedAt: hoursAgo(68),
    category: "transfer",
    league: "MLS",
    leagueLogo: LEAGUE.mls,
    imageUrl: IMG.crowd,
    imageAlt: "MLS supporters celebrating a goal",
  },
  {
    id: "news-021",
    headline: "Urawa Red Diamonds climb to second after controlled second-half display",
    excerpt:
      "A single set-piece goal separated the sides in Saitama. The interim coach praised improved spacing between midfield and attack lines.",
    publishedAt: hoursAgo(72),
    category: "match-report",
    league: "J1 League",
    leagueLogo: LEAGUE.j1,
    imageUrl: IMG.asia,
    imageAlt: "J1 League stadium atmosphere",
  },
  {
    id: "news-022",
    headline: "Ulsan HD striker nominated for monthly K League player award",
    excerpt:
      "Four goals in three appearances underpinned a surge into the title conversation. European scouts were spotted again at the weekend fixture.",
    publishedAt: hoursAgo(76),
    category: "analysis",
    league: "K League 1",
    leagueLogo: LEAGUE.kLeague,
    imageUrl: IMG.boots,
    imageAlt: "Striker celebrating near the corner flag",
  },
  {
    id: "news-023",
    headline: "Al-Nassr explore short-term option in midfield before window closes",
    excerpt:
      "The Saudi Pro League side want cover for continental fixtures and domestic cup runs. A medical is tentatively scheduled for early next week.",
    publishedAt: hoursAgo(80),
    category: "transfer",
    league: "Pro League",
    leagueLogo: LEAGUE.saudiPro,
    imageUrl: IMG.night,
    imageAlt: "Night training under stadium lights",
  },
  {
    id: "news-024",
    headline: "Shanghai Port edge Beijing Guoan in stoppage time after chaotic finale",
    excerpt:
      "Two penalties and a disallowed goal defined a breathless derby. Both managers called for clearer VAR communication post-match.",
    publishedAt: hoursAgo(84),
    category: "match-report",
    league: "Super League",
    leagueLogo: LEAGUE.csl,
    imageUrl: IMG.action,
    imageAlt: "Chinese Super League derby action",
  },
  {
    id: "news-025",
    headline: "Arsenal monitor Ligue 1 centre-forward as backup plan emerges",
    excerpt:
      "Scouts filed positive reports after two recent away trips. The club remains focused on the primary midfield target but wants alternatives ready.",
    publishedAt: hoursAgo(88),
    category: "analysis",
    league: "Premier League",
    leagueLogo: LEAGUE.epl,
    imageUrl: IMG.pitch,
    imageAlt: "Scouts with notepads pitchside",
  },
  {
    id: "news-026",
    headline: "NSW NPL promotion race tightens after leaders drop points at home",
    excerpt:
      "A late equalizer moved three clubs within two points at the summit. Coaches highlighted set-piece defending as the decisive swing.",
    publishedAt: hoursAgo(92),
    category: "match-report",
    league: "NSW NPL",
    leagueLogo: LEAGUE.nswNpl,
    imageUrl: IMG.stadium,
    imageAlt: "Regional NPL ground on matchday",
  },
  {
    id: "news-027",
    headline: "Galaxy veteran could leave on free transfer amid LAFC rivalry buildup",
    excerpt:
      "Contract talks stalled over reduced minutes and a shift to a mentoring role. Pacific Classico ticket demand has already hit season highs.",
    publishedAt: hoursAgo(96),
    category: "transfer",
    league: "MLS",
    leagueLogo: LEAGUE.mls,
    imageUrl: IMG.tunnel,
    imageAlt: "MLS player walking through tunnel",
  },
  {
    id: "news-028",
    headline: "Bayern Munich medical team clears defender for full contact training",
    excerpt:
      "Recovery from a knee complaint progressed faster than expected. Leverkusen scouts will watch closely with the title decider approaching.",
    publishedAt: hoursAgo(100),
    category: "injury",
    league: "Bundesliga",
    leagueLogo: LEAGUE.bundesliga,
    imageUrl: IMG.training,
    imageAlt: "Bayern Munich recovery session",
  },
  {
    id: "news-029",
    headline: "PSG agree terms with Ligue 1 Player of the Month on contract extension",
    excerpt:
      "The club moved quickly to ward off Premier League interest after a run of nine goals in six league games. Announcement expected before the Coupe de France quarter-final.",
    publishedAt: hoursAgo(0.9),
    category: "transfer",
    league: "Ligue 1",
    leagueLogo: LEAGUE.ligue1,
    imageUrl: IMG.transfer,
    imageAlt: "Ligue 1 transfer negotiations",
  },
  {
    id: "news-030",
    headline: "Marseille rally from two down in chaotic Le Classique comeback",
    excerpt:
      "Three goals in eleven second-half minutes flipped the derby on its head at the Vélodrome. Both managers blamed defensive concentration in transition.",
    publishedAt: hoursAgo(2.1),
    category: "match-report",
    league: "Ligue 1",
    leagueLogo: LEAGUE.ligue1,
    imageUrl: IMG.action,
    imageAlt: "Ligue 1 derby atmosphere",
  },
  {
    id: "news-031",
    headline: "Champions League draw sets up heavyweight quarter-final rematch",
    excerpt:
      "UEFA confirmed the tie dates with both clubs meeting for the third season running. Ticket allocation and away travel windows open next week.",
    publishedAt: hoursAgo(2.8),
    category: "preview",
    league: "Champions League",
    leagueLogo: LEAGUE.ucl,
    imageUrl: IMG.stadium,
    imageAlt: "Champions League stadium before kickoff",
  },
  {
    id: "news-032",
    headline: "Star striker fires Champions League hat-trick in statement knockout leg",
    excerpt:
      "A ruthless first-half display put the tie beyond doubt before half-time. Post-match xG maps showed the highest wide overload rate in the competition this season.",
    publishedAt: hoursAgo(4.2),
    category: "match-report",
    league: "Champions League",
    leagueLogo: LEAGUE.ucl,
    imageUrl: IMG.night,
    imageAlt: "Champions League night match",
  },
  {
    id: "news-033",
    headline: "Europa League surprise package reach first quarter-final in club history",
    excerpt:
      "A disciplined low block and two counter-attacks sealed progression on aggregate. The manager credited winter recruitment for adding pace in wide areas.",
    publishedAt: hoursAgo(6.1),
    category: "match-report",
    league: "Europa League",
    leagueLogo: LEAGUE.uel,
    imageUrl: IMG.crowd,
    imageAlt: "Europa League supporters celebrating",
  },
  {
    id: "news-034",
    headline: "Europa League favourites sweat on fitness of captain before second leg",
    excerpt:
      "Training footage showed the skipper limited to individual work. The medical team will decide Thursday whether he travels for the decisive fixture.",
    publishedAt: hoursAgo(8.4),
    category: "injury",
    league: "Europa League",
    leagueLogo: LEAGUE.uel,
    imageUrl: IMG.training,
    imageAlt: "Europa League training session",
  },
  {
    id: "news-035",
    headline: "Ajax academy product linked with Premier League move after breakout spring",
    excerpt:
      "Scouts from three English clubs attended the latest Eredivisie fixture. Ajax insist they will only sell at the right price with sell-on clauses protected.",
    publishedAt: hoursAgo(10.2),
    category: "transfer",
    league: "Eredivisie",
    leagueLogo: LEAGUE.eredivisie,
    imageUrl: IMG.pitch,
    imageAlt: "Eredivisie match action",
  },
  {
    id: "news-036",
    headline: "PSV extend Eredivisie lead with ruthless win at title rivals",
    excerpt:
      "Four different scorers highlighted the depth in Bosz's squad. The result opens a five-point gap with six league rounds remaining.",
    publishedAt: hoursAgo(12.5),
    category: "match-report",
    league: "Eredivisie",
    leagueLogo: LEAGUE.eredivisie,
    imageUrl: IMG.action,
    imageAlt: "Eredivisie goal celebration",
  },
  {
    id: "news-037",
    headline: "Sporting CP close in on Liga Portugal title after late winner at Braga",
    excerpt:
      "A stoppage-time header moved Ruben Amorim's side within touching distance of the championship. Set-piece routines were again the difference.",
    publishedAt: hoursAgo(15.3),
    category: "match-report",
    league: "Liga Portugal",
    leagueLogo: LEAGUE.ligaPortugal,
    imageUrl: IMG.stadium,
    imageAlt: "Liga Portugal stadium panorama",
  },
  {
    id: "news-038",
    headline: "Benfica star winger returns to full training ahead of Lisbon derby",
    excerpt:
      "Recovery from a thigh issue progressed faster than expected. The club stopped short of guaranteeing a start but confirmed he is in the matchday squad.",
    publishedAt: hoursAgo(16.8),
    category: "injury",
    league: "Liga Portugal",
    leagueLogo: LEAGUE.ligaPortugal,
    imageUrl: IMG.training,
    imageAlt: "Liga Portugal training ground",
  },
  {
    id: "news-039",
    headline: "Atlético Madrid grind out narrow win to stay in La Liga title hunt",
    excerpt:
      "A second-half penalty and disciplined low block frustrated visitors at the Metropolitano. Simeone praised the squad's maturity in closing out tight games.",
    publishedAt: hoursAgo(1.6),
    category: "match-report",
    league: "La Liga",
    leagueLogo: LEAGUE.laliga,
    imageUrl: IMG.action,
    imageAlt: "La Liga match under floodlights",
  },
  {
    id: "news-040",
    headline: "Napoli appoint interim boss after shock resignation before run-in",
    excerpt:
      "The Serie A club moved within hours to stabilize the dressing room with five league games before the summer break. Assistant coach takes charge for the weekend.",
    publishedAt: hoursAgo(3.3),
    category: "analysis",
    league: "Serie A",
    leagueLogo: LEAGUE.serieA,
    imageUrl: IMG.crowd,
    imageAlt: "Serie A dugout and coaching staff",
  },
  {
    id: "news-041",
    headline: "Juventus target renewal talks with defensive lynchpin amid Italian interest",
    excerpt:
      "Personal terms are advanced and the club hope to announce before the transfer window opens. A release clause restructure remains the final sticking point.",
    publishedAt: hoursAgo(5.4),
    category: "transfer",
    league: "Serie A",
    leagueLogo: LEAGUE.serieA,
    imageUrl: IMG.transfer,
    imageAlt: "Serie A contract negotiations",
  },
  {
    id: "news-042",
    headline: "RB Leipzig's press triggers turn tide in top-four Bundesliga chase",
    excerpt:
      "Three turnovers inside the opposition half led to two goals in four minutes. Analysts flagged it as the fastest collective recovery sequence this month.",
    publishedAt: hoursAgo(7.1),
    category: "match-report",
    league: "Bundesliga",
    leagueLogo: LEAGUE.bundesliga,
    imageUrl: IMG.pitch,
    imageAlt: "Bundesliga pressing drill",
  },
  {
    id: "news-043",
    headline: "Inter Miami confirm record crowd for Messi homecoming fixture",
    excerpt:
      "Ticket demand broke franchise highs with secondary market prices surging midweek. The club will open additional sections for the return leg.",
    publishedAt: hoursAgo(9.5),
    category: "preview",
    league: "MLS",
    leagueLogo: LEAGUE.mls,
    imageUrl: IMG.crowd,
    imageAlt: "MLS packed stadium on matchday",
  },
  {
    id: "news-044",
    headline: "Vissel Kobe extend J1 lead after clinical counter-attacking display",
    excerpt:
      "Two second-half breaks punished a high defensive line in Yokohama. The win preserves a four-point cushion with the international break approaching.",
    publishedAt: hoursAgo(13.2),
    category: "match-report",
    league: "J1 League",
    leagueLogo: LEAGUE.j1,
    imageUrl: IMG.asia,
    imageAlt: "J1 League away supporters",
  },
  {
    id: "news-045",
    headline: "Al-Hilal set Saudi Pro League scoring record in dominant home rout",
    excerpt:
      "Five different scorers highlighted the depth of the squad heading into continental fixtures. The manager rotated early with an eye on next week's travel.",
    publishedAt: hoursAgo(17.5),
    category: "match-report",
    league: "Pro League",
    leagueLogo: LEAGUE.saudiPro,
    imageUrl: IMG.night,
    imageAlt: "Saudi Pro League night fixture",
  },
];

export function getMockNewsArticles() {
  return [...MOCK_NEWS_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getMockNewsLeagues(articles: NewsArticle[]) {
  const byLeague = new Map<string, { count: number; logo: string | null }>();

  for (const article of articles) {
    const current = byLeague.get(article.league);
    if (current) {
      current.count += 1;
    } else {
      byLeague.set(article.league, { count: 1, logo: article.leagueLogo });
    }
  }

  return [...byLeague.entries()]
    .map(([name, { count, logo }]) => ({ name, count, logo }))
    .sort((a, b) => b.count - a.count);
}
