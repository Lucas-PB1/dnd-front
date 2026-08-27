import type { VehicleTemplateSummary } from "@/entities/vehicle-template/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";

type VehicleTemplateCardProps = {
  template: VehicleTemplateSummary;
  listPath?: string;
};

export function VehicleTemplateCard({
  template,
  listPath,
}: VehicleTemplateCardProps) {
  return (
    <CatalogTileCard
      href={withCatalogReturn(`/vehicles/${template.slug}`, listPath)}
      title={template.name}
      titleExtra={<CatalogEditionChip editionSlug={template.editionSlug} />}
      eyebrow="Veículo"
      meta={
        <>
          {template.armorClass != null ? (
            <span>CA {template.armorClass}</span>
          ) : null}
          {template.hitPoints != null ? (
            <span>{template.hitPoints} PV</span>
          ) : null}
          {template.crewCapacity != null ? (
            <span>Tripulação {template.crewCapacity}</span>
          ) : null}
        </>
      }
    />
  );
}
