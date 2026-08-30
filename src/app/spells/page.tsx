import { Suspense } from "react";

import { SpellsGrid } from "@/features/catalog/spell-catalog/ui/spells-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function SpellsPage() {
  return (
    <CatalogShell
      title="Magias"
      description="Truques e círculos do PHB 2024, Valdas, Eldritch Hunt, Northlands Heroes (Nórdico) e Griffon's Saddlebag — escola, tempo e duração."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando magias…</p>
        }
      >
        <SpellsGrid />
      </Suspense>
    </CatalogShell>
  );
}
