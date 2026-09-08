import { DuelsHome } from "@/features/duel/duels/ui/home/duels-home";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { PageHeader } from "@/shared/ui/catalog-page-header";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

export default function DuelsPage() {
  return (
    <AppPageShell>
      <PageHeader
        title="Duelos"
        description="Desafio 1v1 entre duas contas. Cada um escolhe o próprio personagem e entra pelo código de convite."
        meta={<SourceEditionBadge live />}
      />
      <DuelsHome />
    </AppPageShell>
  );
}
