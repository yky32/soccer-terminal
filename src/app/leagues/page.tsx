import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Leagues",
};

export default function LeaguesPage() {
  return (
    <>
      <PageHeader
        compact
        onGlass
        title="Leagues"
        description="Browse standings, fixtures, and stats across top leagues and competitions."
      />
      <FeaturePlaceholder
        milestones={[
          "League browser with tier and region filters",
          "Live tables and upcoming fixture lists",
          "Drill-down to team and match detail",
        ]}
      />
    </>
  );
}
