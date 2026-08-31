import { Suspense } from "react";

import { HeritageGrid } from "@/features/catalog/heritage-catalog/ui/heritage-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function HeritagesPage() {
  return (
    <CatalogShell
      title="Heranças"
      description="Identidades de Grim Hollow — Anão, Elfo, Accursed e mais. Lore, build tradicional e pool global de traços modulares."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando heranças…</p>
        }
      >
        <HeritageGrid />
      </Suspense>
    </CatalogShell>
  );
}
