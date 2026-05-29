import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Youth Academies",
};

export default function YouthPage() {
  return (
    <>
      <PageHeader
        title="Youth Academies"
        description="Track promising young talents with performance curves, minutes played, and development signals."
      />
      <FeaturePlaceholder
        milestones={[
          "Academy talent watchlist",
          "Minutes and progression charts",
          "Potential rating indicators",
        ]}
      />
    </>
  );
}
