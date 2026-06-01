/** Exact API-Football names → compact bracket labels. */
const EXACT_SHORT: Record<string, string> = {
  "Paris Saint Germain": "PSG",
  "Bayern München": "Bayern",
  "Bayern Munich": "Bayern",
  "Manchester City": "Man City",
  "Manchester United": "Man Utd",
  "Atletico Madrid": "Atlético",
  "Atlético Madrid": "Atlético",
  "Borussia Dortmund": "Dortmund",
  "Bayer Leverkusen": "Leverkusen",
  "Sporting CP": "Sporting",
  "Tottenham": "Spurs",
  "Bodo/Glimt": "Bodø/Glimt",
  "Union St. Gilloise": "Union SG",
  "Eintracht Frankfurt": "Frankfurt",
  "PSV Eindhoven": "PSV",
  "Olympiakos Piraeus": "Olympiacos",
  "Ferencvarosi TC": "Ferencváros",
  "Slavia Praha": "Slavia",
  "Kairat Almaty": "Kairat",
  "Club Brugge KV": "Club Brugge",
  "AS Monaco": "Monaco",
  "Inter": "Inter",
  "AC Milan": "Milan",
  "FC Copenhagen": "Copenhagen",
  "Qarabag": "Qarabağ",
};

export function useKnockoutShortTeamNames(leagueId: string) {
  return leagueId === "ucl" || leagueId === "uel";
}

export function knockoutTeamShortName(fullName: string): string {
  const name = fullName.trim();
  if (!name) return name;

  const exact = EXACT_SHORT[name];
  if (exact) return exact;

  if (/^Manchester\s+/i.test(name)) {
    return name.replace(/^Manchester\s+/i, "Man ");
  }

  if (/^Borussia\s+/i.test(name)) {
    return name.replace(/^Borussia\s+/i, "");
  }

  if (/^Atletico\s+/i.test(name)) {
    return name.replace(/^Atletico\s+/i, "Atl. ");
  }

  if (/^Paris Saint Germain/i.test(name)) {
    return "PSG";
  }

  let shortened = name
    .replace(/\s+U19$/i, "")
    .replace(/\s+(FC|SC|CF|KV)$/i, "")
    .trim();

  const parts = shortened.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && shortened.length > 12) {
    const last = parts[parts.length - 1];
    if (last.length >= 5) {
      return last;
    }
  }

  return shortened;
}
