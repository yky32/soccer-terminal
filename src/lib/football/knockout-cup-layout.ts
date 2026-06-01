import type { KnockoutScheduleSlot } from "@/lib/football/world-cup-2026-knockout-schedule";

export type CupKnockoutSide = {
  roundOf32: KnockoutScheduleSlot[];
  roundOf16: KnockoutScheduleSlot[];
  quarterFinals: KnockoutScheduleSlot[];
  semiFinal: KnockoutScheduleSlot;
};

export type CupKnockoutLayout = {
  left: CupKnockoutSide;
  right: CupKnockoutSide;
  final: KnockoutScheduleSlot;
};

function slot(id: string, matchNumber: number): KnockoutScheduleSlot {
  return { id, matchNumber, date: "" };
}

function slots(prefix: string, start: number, count: number): KnockoutScheduleSlot[] {
  return Array.from({ length: count }, (_, index) =>
    slot(`${prefix}${start + index}`, start + index),
  );
}

/** Standard UEFA two-legged knockout tree (R32 optional). */
export function getCupKnockoutLayout(options: { includeRoundOf32: boolean }): CupKnockoutLayout {
  if (options.includeRoundOf32) {
    return {
      left: {
        roundOf32: slots("L32", 1, 8),
        roundOf16: slots("L16", 17, 4),
        quarterFinals: slots("LQF", 33, 2),
        semiFinal: slot("LSF", 41),
      },
      right: {
        roundOf32: slots("R32", 9, 8),
        roundOf16: slots("R16", 25, 4),
        quarterFinals: slots("RQF", 37, 2),
        semiFinal: slot("RSF", 42),
      },
      final: slot("F", 43),
    };
  }

  return {
    left: {
      roundOf32: [],
      roundOf16: slots("L16", 1, 8),
      quarterFinals: slots("LQF", 17, 2),
      semiFinal: slot("LSF", 25),
    },
    right: {
      roundOf32: [],
      roundOf16: slots("R16", 9, 8),
      quarterFinals: slots("RQF", 21, 2),
      semiFinal: slot("RSF", 26),
    },
    final: slot("F", 27),
  };
}

export function cupLayoutForLeague(leagueId: string): CupKnockoutLayout {
  return getCupKnockoutLayout({
    includeRoundOf32: leagueId === "ucl",
  });
}
