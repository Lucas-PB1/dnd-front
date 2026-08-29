"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchItemBySlug,
  itemKeys,
} from "@/features/catalog/item-catalog/api/items.api";
import { useItemEquipmentDetail } from "@/features/catalog/item-catalog/api/use-item-equipment-detail";
import { ItemCatalogDetailContent } from "@/features/catalog/item-catalog/ui/item-catalog-detail-content";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";

type ItemCatalogDescriptionBlockProps = {
  slug: string;
  itemType?: string;
  enabled?: boolean;
};

/** Descrição completa do catálogo dentro do modal de item na ficha. */
export function ItemCatalogDescriptionBlock({
  slug,
  itemType,
  enabled = true,
}: ItemCatalogDescriptionBlockProps) {
  const detail = useQuery({
    queryKey: itemKeys.detail(slug),
    queryFn: () => fetchItemBySlug(slug),
    enabled,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const resolvedType = detail.data?.itemType ?? itemType;
  const equipment = useItemEquipmentDetail(
    detail.data
      ? {
          slug,
          itemType: detail.data.itemType,
          properties: detail.data.properties,
          kind: detail.data.kind,
        }
      : resolvedType
        ? { slug, itemType: resolvedType, properties: null, kind: null }
        : null,
    enabled && Boolean(detail.data ?? itemType),
  );

  if (detail.isPending) {
    return (
      <p className="text-xs text-muted-foreground">Carregando detalhes…</p>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <p className="text-xs text-muted-foreground">
        Não foi possível carregar a descrição deste item.
      </p>
    );
  }

  return (
    <ItemCatalogDetailContent
      item={detail.data}
      weapon={equipment.weapon}
      armor={equipment.armor}
      equipmentPending={equipment.isPending}
    />
  );
}
