import { SkirmishesHome } from "@/features/skirmish/skirmishes/ui/home/skirmishes-home";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { PageHeader } from "@/shared/ui/catalog-page-header";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

export default function SkirmishesPage() {
  return (
    <AppPageShell>
      <PageHeader
        title="Skirmish"
        description="Combate solo 1v1 contra uma criatura do catálogo. Sem campanha e sem mestre."
        meta={<SourceEditionBadge live />}
      />
      <SkirmishesHome />
    </AppPageShell>
  );
}
