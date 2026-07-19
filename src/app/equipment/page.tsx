import { Suspense } from "react";

import { EquipmentCatalog } from "@/features/equipment-catalog/ui/equipment-catalog";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function EquipmentPage() {
  return (
    <CatalogShell
      title="Equipamento"
      description="Armas, armaduras e itens do PHB 2024 — custo, peso e traços mecânicos."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            Carregando equipamento…
          </p>
        }
      >
        <EquipmentCatalog />
      </Suspense>
    </CatalogShell>
  );
}
