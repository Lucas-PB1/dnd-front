import { Suspense } from "react";

import { VehicleTemplateGrid } from "@/features/catalog/vehicle-template-catalog/ui/vehicle-template-grid";
import { CatalogShell } from "@/widgets/catalog-shell/ui/catalog-shell";

export default function VehiclesPage() {
  return (
    <CatalogShell
      title="Veículos"
      description="Navios, carroças e embarcações — CA, PV, tripulação e ações."
      backHref="/compendium"
      backLabel="Compêndio"
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Carregando veículos…</p>
        }
      >
        <VehicleTemplateGrid />
      </Suspense>
    </CatalogShell>
  );
}
