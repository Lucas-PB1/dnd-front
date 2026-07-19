"use client";

import { Suspense } from "react";

import type { ArmorSummary } from "@/entities/armor/types";
import { useArmorDetail } from "@/features/equipment-catalog/api/use-equipment";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";

type ArmorDetailViewProps = {
  slug: string;
};

function ArmorHero({
  armor,
  backHref,
}: {
  armor: ArmorSummary;
  backHref: string;
}) {
  const stats: { label: string; value: string }[] = [
    { label: "Categoria", value: armor.categoryName },
  ];
  const ac =
    armor.acFormula ?? (armor.acBase != null ? String(armor.acBase) : null);
  if (ac) stats.push({ label: "CA", value: ac });
  if (armor.costText) stats.push({ label: "Custo", value: armor.costText });
  if (armor.weight) stats.push({ label: "Peso", value: armor.weight });
  if (armor.strengthReq != null) {
    stats.push({ label: "Força", value: `${armor.strengthReq}+` });
  }
  stats.push({
    label: "Furtividade",
    value: armor.stealthDisadvantage ? "Desvantagem" : "Normal",
  });
  if (armor.donDoff) {
    stats.push({ label: "Vestir", value: armor.donDoff });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Equipamento"
      title={armor.name}
      eyebrow={armor.categoryName}
      stats={stats}
      statsClassName={
        stats.length >= 3 ? "grid-cols-2 sm:grid-cols-4" : undefined
      }
    />
  );
}

function ArmorDetailBody({ slug }: ArmorDetailViewProps) {
  const { data, isPending, isError, error } = useArmorDetail(slug);
  const backHref = useCatalogBackHref("/equipment?tab=armor");

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando armadura…</p>
    );
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Armadura não encontrada"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <ArmorHero armor={data} backHref={backHref} />
    </div>
  );
}

export function ArmorDetailView({ slug }: ArmorDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando armadura…</p>
      }
    >
      <ArmorDetailBody slug={slug} />
    </Suspense>
  );
}
