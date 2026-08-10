import { CampaignsHome } from "@/features/campaign/campaigns/ui/home/campaigns-home";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { PageHeader } from "@/shared/ui/catalog-page-header";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

export default function CampaignsPage() {
  return (
    <AppPageShell>
      <PageHeader
        title="Campanhas"
        description="Mesas com mestre, jogadores e auxiliares. Personagens vinculados também aparecem em Minhas fichas."
        meta={<SourceEditionBadge live />}
      />
      <CampaignsHome />
    </AppPageShell>
  );
}
