"use client";

import { Suspense } from "react";

import type { WeaponSummary } from "@/entities/weapon/types";
import { useWeaponDetail } from "@/features/equipment-catalog/api/use-equipment";
import {
  weaponCategoryLabel,
  weaponCostText,
  weaponWeightText,
} from "@/features/equipment-catalog/lib/weapon-labels";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type WeaponDetailViewProps = {
  slug: string;
};

function WeaponHero({
  weapon,
  backHref,
}: {
  weapon: WeaponSummary;
  backHref: string;
}) {
  const cost = weaponCostText(weapon);
  const stats: { label: string; value: string }[] = [
    { label: "Categoria", value: weaponCategoryLabel(weapon.category) },
  ];
  if (weapon.damage) {
    const dmg = weapon.versatileDamage
      ? `${weapon.damage} (${weapon.versatileDamage} duas mãos)`
      : weapon.damage;
    stats.push({
      label: "Dano",
      value: weapon.damageType ? `${dmg} ${weapon.damageType}` : dmg,
    });
  }
  if (cost) stats.push({ label: "Custo", value: cost });
  const weight = weaponWeightText(weapon);
  if (weight) stats.push({ label: "Peso", value: weight });

  const range = weapon.range;
  if (range?.normal != null) {
    const rangeText =
      range.max != null
        ? `${range.normal}/${range.max} m`
        : `${range.normal} m`;
    stats.push({ label: "Alcance", value: rangeText });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Equipamento"
      title={weapon.name}
      eyebrow={weaponCategoryLabel(weapon.category)}
      stats={stats}
      statsClassName={
        stats.length >= 3 ? "grid-cols-2 sm:grid-cols-4" : undefined
      }
    />
  );
}

function WeaponDetailBody({ slug }: WeaponDetailViewProps) {
  const { data, isPending, isError, error } = useWeaponDetail(slug);
  const backHref = useCatalogBackHref("/equipment?tab=weapons");

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando arma…</p>;
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Arma não encontrada"
        }
      />
    );
  }

  const properties = data.propertyDetails ?? [];
  const mastery = data.mastery;

  return (
    <div className="flex flex-col gap-12">
      <WeaponHero weapon={data} backHref={backHref} />

      {(properties.length > 0 || mastery) && (
        <section aria-labelledby="weapon-traits" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Traços
            </p>
            <h2
              id="weapon-traits"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Propriedades e maestria
            </h2>
          </div>

          <div className="space-y-3">
            {properties.map((prop) => (
              <CollapsibleCard
                key={prop.slug}
                title={prop.name}
                defaultOpen={properties.length <= 3}
              >
                <PhbProse
                  text={prop.description}
                  className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
                />
              </CollapsibleCard>
            ))}
            {mastery ? (
              <CollapsibleCard title={`Maestria: ${mastery.name}`} defaultOpen>
                <PhbProse
                  text={mastery.description}
                  className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
                />
              </CollapsibleCard>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

export function WeaponDetailView({ slug }: WeaponDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando arma…</p>
      }
    >
      <WeaponDetailBody slug={slug} />
    </Suspense>
  );
}
