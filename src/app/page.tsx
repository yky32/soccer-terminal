import type { Metadata } from "next";
import { GlobalPageHeader } from "@/components/overview/global-page-header";
import { MapCountriesProvider } from "@/components/overview/map-countries-context";
import { MatchMonitorSection } from "@/components/overview/match-monitor-section";
import { WorldMapPreview } from "@/components/overview/world-map-preview";

export const metadata: Metadata = {
  title: "Global",
};

export default function Home() {
  return (
    <MapCountriesProvider>
      <GlobalPageHeader />

      <WorldMapPreview />

      <MatchMonitorSection />
    </MapCountriesProvider>
  );
}
