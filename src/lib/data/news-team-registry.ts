export type NewsTeamRef = {
  id: string;
  name: string;
  logo: string;
  aliases: string[];
};

const TEAM_LOGO = {
  arsenal: "https://media.api-sports.io/football/teams/42.png",
  barcelona: "https://media.api-sports.io/football/teams/529.png",
  realMadrid: "https://media.api-sports.io/football/teams/541.png",
  inter: "https://media.api-sports.io/football/teams/505.png",
  bayern: "https://media.api-sports.io/football/teams/157.png",
  leverkusen: "https://media.api-sports.io/football/teams/168.png",
  lafc: "https://media.api-sports.io/football/teams/1617.png",
  laGalaxy: "https://media.api-sports.io/football/teams/1603.png",
  urawa: "https://media.api-sports.io/football/teams/287.png",
  ulsan: "https://media.api-sports.io/football/teams/2767.png",
  alNassr: "https://media.api-sports.io/football/teams/2939.png",
  shanghai: "https://media.api-sports.io/football/teams/836.png",
  beijing: "https://media.api-sports.io/football/teams/830.png",
} as const;

/** Teams we can detect in wire headlines (aliases sorted longest-first at match time). */
export const NEWS_TEAM_REGISTRY: NewsTeamRef[] = [
  {
    id: "arsenal",
    name: "Arsenal",
    logo: TEAM_LOGO.arsenal,
    aliases: ["Arsenal"],
  },
  {
    id: "real-madrid",
    name: "Real Madrid",
    logo: TEAM_LOGO.realMadrid,
    aliases: ["Real Madrid"],
  },
  {
    id: "barcelona",
    name: "Barcelona",
    logo: TEAM_LOGO.barcelona,
    aliases: ["Barcelona"],
  },
  {
    id: "inter",
    name: "Inter Milan",
    logo: TEAM_LOGO.inter,
    aliases: ["Inter Milan", "Inter"],
  },
  {
    id: "bayern",
    name: "Bayern Munich",
    logo: TEAM_LOGO.bayern,
    aliases: ["Bayern Munich", "Bayern"],
  },
  {
    id: "leverkusen",
    name: "Leverkusen",
    logo: TEAM_LOGO.leverkusen,
    aliases: ["Leverkusen", "Bayer Leverkusen"],
  },
  {
    id: "lafc",
    name: "LAFC",
    logo: TEAM_LOGO.lafc,
    aliases: ["LAFC"],
  },
  {
    id: "galaxy",
    name: "LA Galaxy",
    logo: TEAM_LOGO.laGalaxy,
    aliases: ["LA Galaxy", "Galaxy"],
  },
  {
    id: "urawa",
    name: "Urawa Red Diamonds",
    logo: TEAM_LOGO.urawa,
    aliases: ["Urawa Red Diamonds", "Urawa"],
  },
  {
    id: "ulsan",
    name: "Ulsan HD",
    logo: TEAM_LOGO.ulsan,
    aliases: ["Ulsan HD", "Ulsan"],
  },
  {
    id: "al-nassr",
    name: "Al-Nassr",
    logo: TEAM_LOGO.alNassr,
    aliases: ["Al-Nassr", "Al Nassr"],
  },
  {
    id: "shanghai-port",
    name: "Shanghai Port",
    logo: TEAM_LOGO.shanghai,
    aliases: ["Shanghai Port", "Shanghai"],
  },
  {
    id: "beijing-guoan",
    name: "Beijing Guoan",
    logo: TEAM_LOGO.beijing,
    aliases: ["Beijing Guoan", "Beijing"],
  },
];

const ALIAS_ENTRIES = NEWS_TEAM_REGISTRY.flatMap((team) =>
  team.aliases.map((alias) => ({
    team,
    alias,
    aliasLower: alias.toLowerCase(),
  })),
).sort((a, b) => b.alias.length - a.alias.length);

function isWordBoundary(char: string | undefined) {
  if (!char) return true;
  return !/[a-z0-9]/i.test(char);
}

export function findTeamsInText(text: string, limit = 2): NewsTeamRef[] {
  const normalized = text.toLowerCase();
  const matches: { team: NewsTeamRef; index: number }[] = [];
  const usedIds = new Set<string>();

  for (const { team, aliasLower } of ALIAS_ENTRIES) {
    if (usedIds.has(team.id)) continue;

    let searchFrom = 0;
    while (searchFrom < normalized.length) {
      const index = normalized.indexOf(aliasLower, searchFrom);
      if (index === -1) break;

      const before = index === 0 ? undefined : normalized[index - 1];
      const after =
        index + aliasLower.length >= normalized.length
          ? undefined
          : normalized[index + aliasLower.length];

      if (isWordBoundary(before) && isWordBoundary(after)) {
        matches.push({ team, index });
        usedIds.add(team.id);
        break;
      }

      searchFrom = index + 1;
    }
  }

  return matches
    .sort((a, b) => a.index - b.index)
    .slice(0, limit)
    .map(({ team }) => team);
}

export function findTeamsInHeadline(headline: string, limit = 2) {
  return findTeamsInText(headline, limit);
}
