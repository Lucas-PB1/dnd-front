"use client";

import { Suspense } from "react";

import type { ItemSummary } from "@/entities/item/types";
import { ITEM_TYPE_LABELS_PT } from "@/entities/item/types";
import { useEquipmentCatalogLinks } from "@/features/equipment-catalog/api/use-equipment-catalog-links";
import { useItemDetail } from "@/features/equipment-catalog/api/use-equipment";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { PhbProse } from "@/shared/ui/phb-prose";

type ItemDetailViewProps = {
  slug: string;
};

function ItemHero({ item, backHref }: { item: ItemSummary; backHref: string }) {
  const typeLabel = ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;
  const stats: { label: string; value: string }[] = [
    { label: "Tipo", value: typeLabel },
  ];
  if (item.costText) stats.push({ label: "Custo", value: item.costText });
  if (item.weight) stats.push({ label: "Peso", value: item.weight });

  const attribute = item.properties?.attribute;
  if (typeof attribute === "string" && attribute.trim()) {
    stats.push({ label: "Atributo", value: attribute.toUpperCase() });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Equipamento"
      title={item.name}
      eyebrow={typeLabel}
      stats={stats}
      statsClassName={
        stats.length >= 3 ? "grid-cols-2 sm:grid-cols-3" : undefined
      }
    />
  );
}

function ItemDetailBody({ slug }: ItemDetailViewProps) {
  const { data, isPending, isError, error } = useItemDetail(slug);
  const backHref = useCatalogBackHref("/equipment?tab=items");
  const { links } = useEquipmentCatalogLinks();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando item…</p>;
  }

  if (isError || !data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          error instanceof Error ? error.message : "Item não encontrado"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <ItemHero item={data} backHref={backHref} />

      <section aria-labelledby="item-description" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Descrição
          </p>
          <h2
            id="item-description"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Sobre este item
          </h2>
        </div>

        {data.description?.trim() ? (
          <PhbProse
            text={data.description}
            catalogLinks={links}
            currentSlug={data.slug}
            returnTo={backHref}
            className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem descrição cadastrada.
          </p>
        )}
      </section>
    </div>
  );
}

export function ItemDetailView({ slug }: ItemDetailViewProps) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando item…</p>
      }
    >
      <ItemDetailBody slug={slug} />
    </Suspense>
  );
}
