import { SpellsGrid } from "@/features/spell-catalog/ui/spells-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function SpellsPage() {
  return (
    <CatalogShell
      title="Magias"
      description="Truques e círculos do PHB 2024 — escola, tempo e duração."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <SpellsGrid />
    </CatalogShell>
  );
}
