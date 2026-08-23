import { Suspense } from "react";

import { FeatsGrid } from "@/features/catalog/feat-catalog/ui/catalog/feats-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function FeatsPage() {
  return (
    <CatalogShell
      title="Talentos"
      description="Origem, geral, estilo de luta e mais — pré-requisitos e benefícios (PHB, Valdas, Eldritch Hunt e Northlands Nórdico)."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando talentos…</p>
        }
      >
        <FeatsGrid />
      </Suspense>
    </CatalogShell>
  );
}
