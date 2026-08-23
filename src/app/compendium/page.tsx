import { CompendiumHub } from "@/widgets/compendium-hub/ui/compendium-hub";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function CompendiumPage() {
  return (
    <CatalogShell
      title="Compêndio"
      description="PHB 2024, Valdas Spire, Eldritch Hunt e Northlands Heroes (Nórdico) — classes, espécies, antecedentes, subclasses, talentos, equipamento e magias. Filtre as fontes no topo."
    >
      <CompendiumHub />
    </CatalogShell>
  );
}
