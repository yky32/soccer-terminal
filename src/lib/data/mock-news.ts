import type { NewsArticle } from "@/lib/data/news-article";

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
};

const IMG = {
  stadium: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&auto=format&fit=crop&q=80",
  action: "https://images.unsplash.com/photo-1574629810360-7dfebc45f564?w=900&auto=format&fit=crop&q=80",
  crowd: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&auto=format&fit=crop&q=80",
  training: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&auto=format&fit=crop&q=80",
  boots: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&auto=format&fit=crop&q=80",
  night: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=900&auto=format&fit=crop&q=80",
  pitch: "https://images.unsplash.com/photo-1489944440615-453fc1155c81?w=900&auto=format&fit=crop&q=80",
  asia: "https://images.unsplash.com/photo-1624526267669-8f049a798ced?w=900&auto=format&fit=crop&q=80",
  transfer: "https://images.unsplash.com/photo-1551958219-acbf608874f7?w=900&auto=format&fit=crop&q=80",
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
