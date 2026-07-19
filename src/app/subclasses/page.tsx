import { Suspense } from "react";

import { SubclassesGrid } from "@/features/subclass-catalog/ui/subclasses-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function SubclassesPage() {
  return (
    <CatalogShell
      title="Subclasses"
      description="Arquétipos de cada classe — tagline, resumo e características por nível."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Carregando subclasses…
          </p>
        }
      >
        <SubclassesGrid />
      </Suspense>
    </CatalogShell>
  );
}
