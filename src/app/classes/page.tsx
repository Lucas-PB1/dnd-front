import { Suspense } from "react";

import { ClassesGrid } from "@/features/catalog/class-catalog/ui/classes-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function ClassesPage() {
  return (
    <CatalogShell
      title="Classes"
      description="Arquétipos do PHB 2024, Valdas, Eldritch Hunt e Northlands Heroes (Nórdico) — dado de vida, atributos e perícias."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando classes…</p>
        }
      >
        <ClassesGrid />
      </Suspense>
    </CatalogShell>
  );
}
