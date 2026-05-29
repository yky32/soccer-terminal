import { FeaturePlaceholder } from "@/components/feature-placeholder";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "AI Assistant",
};

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        compact
        title="AI Assistant"
        description="Daily briefings, tactical trend analysis, and a conversational interface for football insights."
      />
      <FeaturePlaceholder
        milestones={[
          "Daily briefing summary",
          "Chat interface for plain-language questions",
          "Tactical trend highlights",
        ]}
      />
    </>
  );
}
