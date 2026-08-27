import { Suspense } from "react";

import { CreatureTemplateGrid } from "@/features/catalog/creature-template-catalog/ui/creature-template-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function CreaturesPage() {
  return (
    <CatalogShell
      title="Criaturas"
      description="Stat blocks de monstros, companheiros e NPCs — referência do compêndio."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando criaturas…</p>
        }
      >
        <CreatureTemplateGrid />
      </Suspense>
    </CatalogShell>
  );
}
