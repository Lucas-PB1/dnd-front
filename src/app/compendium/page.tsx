import { CompendiumHub } from "@/widgets/compendium-hub/ui/compendium-hub";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function CompendiumPage() {
  return (
    <CatalogShell
      title="Compêndio PHB"
      description="Catálogo público do Player’s Handbook 2024 — leia sem login."
    >
      <CompendiumHub />
    </CatalogShell>
  );
}
