"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ItemSummary } from "@/entities/item/types";
import {
  fetchItemBySlug,
  itemKeys,
} from "@/features/catalog/item-catalog/api/items.api";
import { useItemEquipmentDetail } from "@/features/catalog/item-catalog/api/use-item-equipment-detail";
import {
  ItemCatalogDetailContent,
  ITEM_CATALOG_DETAIL_DIALOG_CLASS,
  ITEM_CATALOG_DETAIL_DIALOG_OVERLAY_CLASS,
  ITEM_CATALOG_DETAIL_DIALOG_VIEWPORT_CLASS,
} from "@/features/catalog/item-catalog/ui/item-catalog-detail-content";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { itemCatalogMetaLine } from "@/features/catalog/item-catalog/lib/item-catalog-meta";

type ItemCatalogDetailTriggerProps = {
  item: Pick<ItemSummary, "slug" | "name"> &
    Partial<Omit<ItemSummary, "slug" | "name">>;
  variant?: "icon" | "text";
  className?: string;
};

/** Abre detalhe do item (descrição + metadados) sem sair da loja/ficha. */
export function ItemCatalogDetailTrigger({
  item,
  variant = "icon",
  className,
}: ItemCatalogDetailTriggerProps) {
  const [open, setOpen] = useState(false);
  const detail = useQuery({
    queryKey: itemKeys.detail(item.slug),
    queryFn: () => fetchItemBySlug(item.slug),
    enabled: open,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const resolved = detail.data ?? (item as ItemSummary);
  const equipment = useItemEquipmentDetail(
    {
      slug: resolved.slug,
      itemType: resolved.itemType,
      properties: resolved.properties,
      kind: resolved.kind,
    },
    open,
  );
  const subtitle = itemCatalogMetaLine(resolved);

  return (
    <>
      {variant === "text" ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            "min-w-0 text-left underline-offset-2 hover:underline",
            className,
          )}
          title="Ver o que este item faz"
        >
          {item.name}
        </button>
      ) : (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className={cn("size-7 shrink-0 p-0 text-muted-foreground", className)}
          aria-label={`Ver detalhe de ${item.name}`}
          title={`Ver o que ${item.name} faz`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
        >
          <InformationCircleIcon className="size-4" aria-hidden />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          overlayClassName={ITEM_CATALOG_DETAIL_DIALOG_OVERLAY_CLASS}
          viewportClassName={ITEM_CATALOG_DETAIL_DIALOG_VIEWPORT_CLASS}
          className={cn(
            "flex max-h-[min(92vh,44rem)] flex-col gap-3 overflow-hidden",
            ITEM_CATALOG_DETAIL_DIALOG_CLASS,
          )}
        >
          <DialogHeader className="shrink-0 border-b border-border/60 pb-3">
            <DialogTitle>{resolved.name}</DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ItemCatalogDetailContent
              item={resolved}
              weapon={equipment.weapon}
              armor={equipment.armor}
              equipmentPending={equipment.isPending}
              isLoading={detail.isPending && !detail.data}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
