import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Scouting",
};

export default function ScoutingPage() {
  return (
    <>
      <PageHeader
        title="Scouting Intelligence"
        description="Advanced player search, side-by-side comparison, and similarity discovery for talent analysts."
      />
      <FeaturePlaceholder
        milestones={[
          "Player search with smart filters",
          "Radar chart comparisons",
          "Similar player recommendations",
        ]}
      />
    </>
  );
}
