"use client";

import Link from "next/link";

import type { WeaponSummary } from "@/entities/weapon/types";
import { useWeaponDetail } from "@/features/equipment-catalog/api/use-equipment";
import {
  formatWeaponMasteryId,
  weaponCategoryLabel,
  weaponCostText,
  weaponPropertyLabels,
} from "@/features/equipment-catalog/lib/weapon-labels";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";

type WeaponDetailViewProps = {
  slug: string;
};

function WeaponHero({ weapon }: { weapon: WeaponSummary }) {
  const cost = weaponCostText(weapon);
  const stats: { label: string; value: string }[] = [
    { label: "Categoria", value: weaponCategoryLabel(weapon.category) },
  ];
  if (weapon.damage) {
    stats.push({
      label: "Dano",
      value: weapon.damageType
        ? `${weapon.damage} ${weapon.damageType}`
        : weapon.damage,
    });
  }
  if (cost) stats.push({ label: "Custo", value: cost });
  if (weapon.weight) stats.push({ label: "Peso", value: weapon.weight });

  const range = weapon.properties?.range;
  if (range?.normal != null) {
    const rangeText =
      range.max != null
        ? `${range.normal}/${range.max} m`
        : `${range.normal} m`;
    stats.push({ label: "Alcance", value: rangeText });
  }

  return (
    <header className="relative overflow-hidden rounded-xl border border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href="/equipment">Equipamento</BackLink>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {weapon.name}
          </h1>
          <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
            {weaponCategoryLabel(weapon.category)}
          </p>
        </div>

        <dl
          className={cn(
            "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
            stats.length >= 3
              ? "grid-cols-2 sm:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4"
            >
              <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1 font-heading text-base font-semibold leading-tight sm:text-lg">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

export function WeaponDetailView({ slug }: WeaponDetailViewProps) {
  const { data, isPending, isError, error } = useWeaponDetail(slug);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando arma…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Arma não encontrada"}
        </p>
        <Link
          href="/equipment"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar ao equipamento
        </Link>
      </div>
    );
  }

  const properties = weaponPropertyLabels(data.properties);
  const masteryId = data.properties?.masteryId;

  return (
    <div className="flex flex-col gap-12">
      <WeaponHero weapon={data} />

      {(properties.length > 0 || masteryId) && (
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

          <dl className="space-y-3 border-t border-border pt-4">
            {properties.length > 0 ? (
              <div className="space-y-1">
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Propriedades
                </dt>
                <dd className="text-base text-foreground/90">
                  {properties.join(" · ")}
                </dd>
              </div>
            ) : null}
            {masteryId ? (
              <div className="space-y-1">
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Maestria
                </dt>
                <dd className="text-base text-foreground/90">
                  {formatWeaponMasteryId(masteryId)}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      )}
    </div>
  );
}
