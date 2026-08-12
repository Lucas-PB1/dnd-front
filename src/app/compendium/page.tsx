import { CompendiumHub } from "@/widgets/compendium-hub/ui/compendium-hub";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function CompendiumPage() {
  return (
    <CatalogShell
      title="Compêndio"
      description="PHB 2024, Valdas Spire e Eldritch Hunt — classes, espécies, subclasses, talentos, equipamento e magias. Filtre as fontes no topo."
    >
      <CompendiumHub />
    </CatalogShell>
  );
}
