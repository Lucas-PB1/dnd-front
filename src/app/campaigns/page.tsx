import { CampaignsHome } from "@/features/campaigns/ui/campaigns-home";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

export default function CampaignsPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <div className="mb-6 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Campanhas
            </h1>
            <SourceEditionBadge live />
          </div>
          <p className="text-sm text-muted-foreground">
            Mesas com mestre, jogadores e auxiliares. Personagens vinculados
            também aparecem em Minhas fichas.
          </p>
        </div>
        <CampaignsHome />
      </PageMain>
    </div>
  );
}
