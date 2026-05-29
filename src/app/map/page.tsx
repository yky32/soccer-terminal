import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Global Map",
};

export default function MapPage() {
  return (
    <>
      <PageHeader
        compact
        title="Global Map"
        description="Interactive world map with live and upcoming matches, filterable by league tier, youth, women's football, and more."
      />
      <FeaturePlaceholder
        milestones={[
          "World map with match pins",
          "Layer toggles for Youth, Women's, and Top Leagues",
          "Match detail panel on pin click",
        ]}
      />
    </>
  );
}
