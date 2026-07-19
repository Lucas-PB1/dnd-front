import { Suspense } from "react";

import { LanguagesGrid } from "@/features/language-catalog/ui/languages-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function LanguagesPage() {
  return (
    <CatalogShell
      title="Idiomas"
      description="Línguas comuns e raras do PHB 2024 — escrita e falantes típicos."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando idiomas…</p>
        }
      >
        <LanguagesGrid />
      </Suspense>
    </CatalogShell>
  );
}
