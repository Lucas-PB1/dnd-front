import { EncounterView } from "@/features/campaign/campaigns/ui/encounter/encounter-view";
import { AppPageShell } from "@/shared/ui/app-page-shell";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignEncounterPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppPageShell width="wide" mainClassName="gap-0 py-3 sm:py-4">
      <EncounterView campaignId={id} />
    </AppPageShell>
  );
}
