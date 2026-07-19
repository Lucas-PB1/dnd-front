import { CompendiumHub } from "@/widgets/compendium-hub/ui/compendium-hub";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function CompendiumPage() {
  return (
    <CatalogShell
      title="Compêndio"
      description="O PHB 2024 na ponta dos dedos — classes, espécies, antecedentes, talentos, equipamento e magias."
    >
      <CompendiumHub />
    </CatalogShell>
  );
}
