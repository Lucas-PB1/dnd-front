import { CampaignDetailView } from "@/features/campaigns/ui/campaign-detail-view";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <div className="mb-4">
          <SourceEditionBadge live />
        </div>
        <CampaignDetailView campaignId={id} />
      </PageMain>
    </div>
  );
}
