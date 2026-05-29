import { NextResponse } from "next/server";
import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import { getFootballDataProvider } from "@/lib/football/get-provider";

export const revalidate = 60;

export async function GET() {
  try {
    const provider = getFootballDataProvider();
    const snapshot = await provider.getLiveCountries();
    const stats = getLiveMatchStats(snapshot.countries);

    return NextResponse.json({
      ...stats,
      countries: snapshot.countries,
      updatedAt: snapshot.updatedAt,
      provider: snapshot.provider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load live countries";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
