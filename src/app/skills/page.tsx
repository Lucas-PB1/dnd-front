import { Suspense } from "react";

import { SkillsGrid } from "@/features/skill-catalog/ui/skills-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function SkillsPage() {
  return (
    <CatalogShell
      title="Perícias"
      description="As dezoito perícias do PHB 2024 — atributo ligado e quando usá-las."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando perícias…</p>
        }
      >
        <SkillsGrid />
      </Suspense>
    </CatalogShell>
  );
}
