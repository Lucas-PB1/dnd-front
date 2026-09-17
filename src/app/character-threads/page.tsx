import { Suspense } from "react";

import { CharacterThreadGrid } from "@/features/catalog/character-thread-catalog/ui/character-thread-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function CharacterThreadsPage() {
  return (
    <CatalogShell
      title="Threads"
      description="Arcos narrativos de Northlands — objetivos, marcos e benefícios. Um thread ativo por personagem."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando threads…</p>
        }
      >
        <CharacterThreadGrid />
      </Suspense>
    </CatalogShell>
  );
}
