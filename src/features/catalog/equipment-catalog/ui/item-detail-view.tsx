"use client";

import { Suspense } from "react";

import type { ItemSummary } from "@/entities/item/types";
import { ITEM_TYPE_LABELS_PT } from "@/entities/item/types";
import { useEquipmentCatalogLinks } from "@/features/catalog/equipment-catalog/api/use-equipment-catalog-links";
import { useItemDetail } from "@/features/catalog/equipment-catalog/api/use-equipment";
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
  const props = item.properties ?? null;
  const rarityLabel =
    typeof props?.rarityLabel === "string" ? props.rarityLabel : null;
  const category =
    typeof props?.category === "string" ? props.category : null;
  const header = typeof props?.header === "string" ? props.header : null;
  const attunement =
    typeof props?.attunement === "string"
      ? props.attunement
      : props?.requiresAttunement === true
        ? "Requer Sintonização"
        : null;
  const editionSlug =
    typeof props?.editionSlug === "string" ? props.editionSlug : null;
  const magic = props?.magic === true;
  const consumable = props?.consumable === true;

  const stats: { label: string; value: string }[] = [
    { label: "Tipo", value: category ?? typeLabel },
  ];
  if (magic) stats.push({ label: "Mágico", value: "Sim" });
  if (rarityLabel) stats.push({ label: "Raridade", value: rarityLabel });
  if (attunement) stats.push({ label: "Sintonização", value: attunement });
  if (consumable) stats.push({ label: "Consumível", value: "Sim" });
  if (editionSlug) stats.push({ label: "Fonte", value: editionSlug });
  if (item.costText) stats.push({ label: "Custo", value: item.costText });
  if (item.weight) stats.push({ label: "Peso", value: item.weight });

  const attribute = props?.attribute;
  if (typeof attribute === "string" && attribute.trim()) {
    stats.push({ label: "Atributo", value: attribute.toUpperCase() });
  }

  const eyebrow = [magic ? "Item mágico" : null, rarityLabel, typeLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Equipamento"
      title={item.name}
      eyebrow={eyebrow || typeLabel}
      summary={header && header !== rarityLabel ? header : undefined}
      stats={stats}
    />
  );
}

function ItemDetailBody({ slug }: ItemDetailViewProps) {
  const { data, isPending, isError, error } = useItemDetail(slug);
  const magic = data?.properties?.magic === true;
  const backHref = useCatalogBackHref(
    magic ? "/equipment?tab=magic" : "/equipment?tab=items",
  );
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
