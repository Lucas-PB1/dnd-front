import { Suspense } from "react";

import { FightingStylesGrid } from "@/features/fighting-style-catalog/ui/fighting-styles-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function FightingStylesPage() {
  return (
    <CatalogShell
      title="Estilos de luta"
      description="Opções de estilo de luta do PHB 2024 — benefício completo de cada escolha."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Carregando estilos de luta…
          </p>
        }
      >
        <FightingStylesGrid />
      </Suspense>
    </CatalogShell>
  );
}
