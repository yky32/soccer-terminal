/**
 * FIFA World Cup 2026 knockout match dates (matches 73–104).
 * Source: FIFA published tournament schedule — teams TBD until fixtures are drawn from results.
 */

export type KnockoutScheduleSlot = {
  id: string;
  matchNumber: number;
  /** Calendar date (YYYY-MM-DD) */
  date: string;
};

const SLOTS: KnockoutScheduleSlot[] = [
  { id: "M73", matchNumber: 73, date: "2026-06-28" },
  { id: "M74", matchNumber: 74, date: "2026-06-29" },
  { id: "M75", matchNumber: 75, date: "2026-06-29" },
  { id: "M76", matchNumber: 76, date: "2026-06-29" },
  { id: "M77", matchNumber: 77, date: "2026-06-30" },
  { id: "M78", matchNumber: 78, date: "2026-06-30" },
  { id: "M79", matchNumber: 79, date: "2026-06-30" },
  { id: "M80", matchNumber: 80, date: "2026-07-01" },
  { id: "M81", matchNumber: 81, date: "2026-07-01" },
  { id: "M82", matchNumber: 82, date: "2026-07-01" },
  { id: "M83", matchNumber: 83, date: "2026-07-02" },
  { id: "M84", matchNumber: 84, date: "2026-07-02" },
  { id: "M85", matchNumber: 85, date: "2026-07-02" },
  { id: "M86", matchNumber: 86, date: "2026-07-03" },
  { id: "M87", matchNumber: 87, date: "2026-07-03" },
  { id: "M88", matchNumber: 88, date: "2026-07-03" },
  { id: "M89", matchNumber: 89, date: "2026-07-04" },
  { id: "M90", matchNumber: 90, date: "2026-07-04" },
  { id: "M91", matchNumber: 91, date: "2026-07-05" },
  { id: "M92", matchNumber: 92, date: "2026-07-05" },
  { id: "M93", matchNumber: 93, date: "2026-07-06" },
  { id: "M94", matchNumber: 94, date: "2026-07-06" },
  { id: "M95", matchNumber: 95, date: "2026-07-07" },
  { id: "M96", matchNumber: 96, date: "2026-07-07" },
  { id: "M97", matchNumber: 97, date: "2026-07-09" },
  { id: "M98", matchNumber: 98, date: "2026-07-10" },
  { id: "M99", matchNumber: 99, date: "2026-07-11" },
  { id: "M100", matchNumber: 100, date: "2026-07-11" },
  { id: "M101", matchNumber: 101, date: "2026-07-14" },
  { id: "M102", matchNumber: 102, date: "2026-07-15" },
  { id: "M103", matchNumber: 103, date: "2026-07-18" },
  { id: "M104", matchNumber: 104, date: "2026-07-19" },
];

const SLOT_BY_ID = new Map(SLOTS.map((slot) => [slot.id, slot]));

export function getKnockoutScheduleSlot(id: string): KnockoutScheduleSlot | null {
  return SLOT_BY_ID.get(id) ?? null;
}

export function formatKnockoutMatchDate(date: string) {
  if (!date) return "TBD";

  return new Date(`${date}T12:00:00`).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export type WorldCupKnockoutBracketLayout = {
  left: {
    roundOf32: KnockoutScheduleSlot[];
    roundOf16: KnockoutScheduleSlot[];
    quarterFinals: KnockoutScheduleSlot[];
    semiFinal: KnockoutScheduleSlot;
  };
  right: {
    roundOf32: KnockoutScheduleSlot[];
    roundOf16: KnockoutScheduleSlot[];
    quarterFinals: KnockoutScheduleSlot[];
    semiFinal: KnockoutScheduleSlot;
  };
  bronze: KnockoutScheduleSlot;
  final: KnockoutScheduleSlot;
};

function slots(ids: string[]): KnockoutScheduleSlot[] {
  return ids.map((id) => SLOT_BY_ID.get(id)).filter((slot): slot is KnockoutScheduleSlot => Boolean(slot));
}

/** Bracket column order for the 48-team World Cup knockout tree. */
export function getWorldCup2026KnockoutLayout(): WorldCupKnockoutBracketLayout {
  return {
    left: {
      roundOf32: slots(["M73", "M74", "M75", "M76", "M77", "M78", "M79", "M80"]),
      roundOf16: slots(["M89", "M90", "M91", "M92"]),
      quarterFinals: slots(["M97", "M98"]),
      semiFinal: slots(["M101"])[0]!,
    },
    right: {
      roundOf32: slots(["M81", "M82", "M83", "M84", "M85", "M86", "M87", "M88"]),
      roundOf16: slots(["M93", "M94", "M95", "M96"]),
      quarterFinals: slots(["M99", "M100"]),
      semiFinal: slots(["M102"])[0]!,
    },
    bronze: slots(["M103"])[0]!,
    final: slots(["M104"])[0]!,
  };
}

export const WORLD_CUP_2026_KNOCKOUT_ROUNDS_MOBILE = [
  { title: "Round of 32", ids: ["M73", "M74", "M75", "M76", "M77", "M78", "M79", "M80", "M81", "M82", "M83", "M84", "M85", "M86", "M87", "M88"] },
  { title: "Round of 16", ids: ["M89", "M90", "M91", "M92", "M93", "M94", "M95", "M96"] },
  { title: "Quarter-finals", ids: ["M97", "M98", "M99", "M100"] },
  { title: "Semi-finals", ids: ["M101", "M102"] },
  { title: "Bronze final", ids: ["M103"], stage: "bronze" as const },
  { title: "Final", ids: ["M104"], stage: "final" as const },
] as const;
