"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/deferred-mount";
import { MapSectionSkeleton } from "@/components/loading/route-skeletons";

const WorldMapPreview = dynamic(
  () =>
    import("@/components/overview/world-map-preview").then((module) => ({
      default: module.WorldMapPreview,
    })),
  {
    ssr: false,
    loading: () => <MapSectionSkeleton variant="map" />,
  },
);

const MatchMonitorSection = dynamic(
  () =>
    import("@/components/overview/match-monitor-section").then((module) => ({
      default: module.MatchMonitorSection,
    })),
  {
    ssr: false,
    loading: () => <MapSectionSkeleton variant="monitor" />,
  },
);

export function GlobalMapSection() {
  return (
    <>
      <DeferredMount placeholder={<MapSectionSkeleton variant="map" />}>
        <WorldMapPreview />
      </DeferredMount>
      <DeferredMount
        placeholder={<MapSectionSkeleton variant="monitor" />}
        rootMargin="320px 0px"
      >
        <MatchMonitorSection />
      </DeferredMount>
    </>
  );
}
