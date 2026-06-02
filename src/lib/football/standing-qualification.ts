/** Qualification meaning for a table row — from API-Football `description`. */
export type StandingQualificationZone =
  | "champions-league"
  | "champions-league-qualifiers"
  | "europa-league"
  | "conference-league"
  | "promotion"
  | "promotion-playoff"
  | "relegation"
  | "relegation-playoff";

export type StandingQualification = {
  zone: StandingQualificationZone;
  /** Human-readable label for legend and tooltips. */
  label: string;
};

const ZONE_ORDER: StandingQualificationZone[] = [
  "champions-league",
  "champions-league-qualifiers",
  "europa-league",
  "conference-league",
  "promotion",
  "promotion-playoff",
  "relegation-playoff",
  "relegation",
];

export function resolveStandingQualification(
  description: string | null | undefined,
): StandingQualification | null {
  const raw = description?.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  let zone: StandingQualificationZone | null = null;

  if (/relegation/.test(lower)) {
    zone = /play.?off|playoff/.test(lower) ? "relegation-playoff" : "relegation";
  } else if (/champions league/.test(lower)) {
    zone =
      /qualif|play.?off|playoff|preliminary/.test(lower)
        ? "champions-league-qualifiers"
        : "champions-league";
  } else if (/europa league/.test(lower)) {
    zone = "europa-league";
  } else if (/conference league|uefa conference/.test(lower)) {
    zone = "conference-league";
  } else if (/promotion/.test(lower)) {
    zone = /play.?off|playoff/.test(lower) ? "promotion-playoff" : "promotion";
  }

  if (!zone) return null;

  return {
    zone,
    label: formatQualificationLabel(raw, zone),
  };
}

function formatQualificationLabel(
  description: string,
  zone: StandingQualificationZone,
): string {
  const stripped = description
    .replace(/^promotion\s*-\s*/i, "")
    .replace(/^relegation\s*-\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .trim();

  if (stripped) return stripped;

  switch (zone) {
    case "champions-league":
    case "champions-league-qualifiers":
      return "Champions League";
    case "europa-league":
      return "Europa League";
    case "conference-league":
      return "Conference League";
    case "relegation":
      return "Relegation";
    case "relegation-playoff":
      return "Relegation play-off";
    case "promotion":
      return "Promotion";
    case "promotion-playoff":
      return "Promotion play-off";
    default:
      return description;
  }
}

type ZoneStyle = {
  borderClass: string;
  rowClass: string;
  dotClass: string;
};

const ZONE_STYLES: Record<StandingQualificationZone, ZoneStyle> = {
  "champions-league": {
    borderClass: "border-l-sky-600",
    rowClass: "bg-sky-500/[0.06]",
    dotClass: "bg-sky-600",
  },
  "champions-league-qualifiers": {
    borderClass: "border-l-sky-400",
    rowClass: "bg-sky-400/[0.05]",
    dotClass: "bg-sky-400",
  },
  "europa-league": {
    borderClass: "border-l-violet-600",
    rowClass: "bg-violet-500/[0.06]",
    dotClass: "bg-violet-600",
  },
  "conference-league": {
    borderClass: "border-l-amber-600",
    rowClass: "bg-amber-500/[0.06]",
    dotClass: "bg-amber-600",
  },
  promotion: {
    borderClass: "border-l-emerald-600",
    rowClass: "bg-emerald-500/[0.06]",
    dotClass: "bg-emerald-600",
  },
  "promotion-playoff": {
    borderClass: "border-l-emerald-400",
    rowClass: "bg-emerald-400/[0.05]",
    dotClass: "bg-emerald-400",
  },
  "relegation-playoff": {
    borderClass: "border-l-rose-400",
    rowClass: "bg-rose-400/[0.05]",
    dotClass: "bg-rose-400",
  },
  relegation: {
    borderClass: "border-l-rose-600",
    rowClass: "bg-rose-500/[0.06]",
    dotClass: "bg-rose-600",
  },
};

export function standingQualificationStyles(zone: StandingQualificationZone | null | undefined) {
  if (!zone) return null;
  return ZONE_STYLES[zone];
}

export function standingQualificationLegend(
  standings: Array<{
    qualificationZone?: StandingQualificationZone | null;
    qualificationLabel?: string | null;
  }>,
) {
  const seen = new Map<StandingQualificationZone, string>();

  for (const row of standings) {
    if (!row.qualificationZone || !row.qualificationLabel) continue;
    if (!seen.has(row.qualificationZone)) {
      seen.set(row.qualificationZone, row.qualificationLabel);
    }
  }

  return ZONE_ORDER.filter((zone) => seen.has(zone)).map((zone) => ({
    zone,
    label: seen.get(zone)!,
    ...ZONE_STYLES[zone],
  }));
}
