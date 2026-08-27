"use client";

import { useVehicleTemplateDetail } from "@/features/catalog/vehicle-template-catalog/api/use-vehicle-templates";
import { LinkTemplateToCharacter } from "@/features/catalog/template-link/ui/link-template-to-character";
import { StatBlockCard } from "@/features/catalog/template-stat-block/ui/stat-block-card";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";

type VehicleTemplateDetailViewProps = {
  slug: string;
};

export function VehicleTemplateDetailView({
  slug,
}: VehicleTemplateDetailViewProps) {
  const backHref = useCatalogBackHref("/vehicles");
  const detail = useVehicleTemplateDetail(slug);

  if (detail.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (detail.isError || !detail.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message="Veículo não encontrado."
      />
    );
  }

  const template = detail.data;

  return (
    <div className="space-y-6">
      <CatalogDetailHero
        backHref={backHref}
        backLabel="Veículos"
        title={template.name}
        eyebrow="Veículo"
      />

      <StatBlockCard
        variant="vehicle"
        name={template.name}
        subtitle={template.subtitle}
        armorClass={template.armorClass}
        initiativeModifier={template.initiativeModifier}
        hitPoints={template.hitPoints}
        damageThreshold={template.damageThreshold}
        speeds={template.speeds}
        abilityScores={template.abilityScores}
        crewCapacity={template.crewCapacity}
        passengerCapacity={template.passengerCapacity}
        cargoCapacityLabel={template.cargoCapacityLabel}
        traits={template.traits}
        actions={template.actions}
      />

      <LinkTemplateToCharacter
        templateSlug={template.slug}
        templateName={template.name}
        actorKind="vehicle"
        loginNext={`/vehicles/${slug}`}
      />
    </div>
  );
}
