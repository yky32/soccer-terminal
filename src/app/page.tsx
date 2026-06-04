import { GlobalPageHeader } from "@/components/overview/global-page-header";
import { GlobalSectionNav } from "@/components/overview/global-section-nav";
import { MapCountriesProvider } from "@/components/overview/map-countries-context";
import { GlobalMapSection } from "@/components/overview/global-map-section";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Live Football Map & Scores",
  description:
    "Follow live and upcoming football on an interactive global map — league standings, fixtures, lineups, and match stats.",
  path: "/",
});

export default function Home() {
  return (
    <MapCountriesProvider>
      <GlobalPageHeader />
      <GlobalSectionNav />
      <GlobalMapSection />
    </MapCountriesProvider>
  );
}
