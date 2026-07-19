import { Suspense } from "react";

import { SpeciesGrid } from "@/features/species-catalog/ui/species-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function SpeciesPage() {
  return (
    <CatalogShell
      title="Espécies"
      description="Povos do PHB 2024 — tamanho, deslocamento e traços."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando espécies…</p>
        }
      >
        <SpeciesGrid />
      </Suspense>
    </CatalogShell>
  );
}
