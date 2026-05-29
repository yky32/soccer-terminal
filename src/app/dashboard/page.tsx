import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        description="Customizable multi-panel layout for live matches, tactical views, player radars, and league tables."
      />
      <FeaturePlaceholder
        milestones={[
          "Card-based dashboard grid",
          "Live match + tactical pitch panel",
          "Saved layout preferences",
        ]}
      />
    </>
  );
}
