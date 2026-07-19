import { BackgroundsGrid } from "@/features/background-catalog/ui/backgrounds-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function BackgroundsPage() {
  return (
    <CatalogShell
      title="Antecedentes"
      description="Origens do PHB 2024 — atributos, perícias e equipamento."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <BackgroundsGrid />
    </CatalogShell>
  );
}
