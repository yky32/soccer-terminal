import { GlobalPageHeader } from "@/components/overview/global-page-header";
import { GlobalSectionNav } from "@/components/overview/global-section-nav";
import { MapCountriesProvider } from "@/components/overview/map-countries-context";
import { GlobalMapSection } from "@/components/overview/global-map-section";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Global",
  description:
    "Live and upcoming matches on a global map, with league coverage and a personal match monitor.",
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
