import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Women's Football",
};

export default function WomenPage() {
  return (
    <>
      <PageHeader
        compact
        title="Women's Football"
        description="Dedicated hub for women's leagues, fixtures, and analytics with growing global coverage."
      />
      <FeaturePlaceholder
        milestones={[
          "Women's league fixtures and standings",
          "Player and team spotlight cards",
          "Cross-league comparison filters",
        ]}
      />
    </>
  );
}
