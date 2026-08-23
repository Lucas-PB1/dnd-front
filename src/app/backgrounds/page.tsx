import { Suspense } from "react";

import { BackgroundsGrid } from "@/features/catalog/background-catalog/ui/backgrounds-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function BackgroundsPage() {
  return (
    <CatalogShell
      title="Antecedentes"
      description="Origens do PHB 2024, Valdas, Eldritch Hunt e Northlands Heroes (Nórdico) — atributos, perícias e equipamento."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Carregando antecedentes…
          </p>
        }
      >
        <BackgroundsGrid />
      </Suspense>
    </CatalogShell>
  );
}
