import { CampaignDetailView } from "@/features/campaign/campaigns/ui/detail/campaign-detail-view";
import { AppPageShell } from "@/shared/ui/app-page-shell";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppPageShell>
      <CampaignDetailView campaignId={id} />
    </AppPageShell>
  );
}
