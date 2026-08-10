import { EncounterView } from "@/features/campaign/campaigns/ui/encounter/encounter-view";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignEncounterPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppPageShell atmosphere={false}>
      <div className="mb-2">
        <SourceEditionBadge live />
      </div>
      <EncounterView campaignId={id} />
    </AppPageShell>
  );
}
