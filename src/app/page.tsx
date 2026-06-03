import type { Metadata } from "next";
import { GlobalPageHeader } from "@/components/overview/global-page-header";
import { GlobalSectionNav } from "@/components/overview/global-section-nav";
import { MapCountriesProvider } from "@/components/overview/map-countries-context";
import { GlobalMapSection } from "@/components/overview/global-map-section";
import { pageTitle } from "@/lib/metadata";

export const metadata: Metadata = {
  title: pageTitle("Global"),
};

export default function Home() {
  return (
    <MapCountriesProvider>
      <GlobalPageHeader />
      <GlobalSectionNav />
      <GlobalMapSection />
    </MapCountriesProvider>
  );
}
