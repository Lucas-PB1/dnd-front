"use client";

import { TrashIcon } from "@heroicons/react/24/outline";

import type { InventoryItem } from "@/entities/character/session-types";
import type { BeyondShopCartLine } from "@/features/character/character-sheet/lib/inventory/beyond-shop-cart-line";
import {
  formatShopAttachLabel,
  formatShopAttachPreview,
  formatShopBundleLabel,
  formatShopBundlePreview,
  formatShopLineCost,
  isShopAttachLine,
  isShopBundleLine,
  supportsShopLineQuantity,
} from "@/features/character/character-sheet/lib/inventory/beyond-shop-cart-line";
import { ItemCatalogDetailTrigger } from "@/features/catalog/item-catalog/ui/item-catalog-detail-trigger";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type BeyondShopCartLineRowProps = {
  line: BeyondShopCartLine;
  inventoryItems: InventoryItem[];
  onRemove: () => void;
  onQuantityChange: (delta: -1 | 1) => void;
};

export function BeyondShopCartLineRow({
  line,
  inventoryItems,
  onRemove,
  onQuantityChange,
}: BeyondShopCartLineRowProps) {
  const bundle = isShopBundleLine(line);
  const attach = isShopAttachLine(line);
  const label = bundle
    ? formatShopBundleLabel(
        line.item,
        line.coverageItem!,
        line.attachCoverageBonus,
      )
    : attach
      ? formatShopAttachLabel(
          line.item,
          line.attachToBaseSlug!,
          inventoryItems,
          line.attachCoverageBonus,
        )
      : line.item.name;

  const preview = bundle
    ? formatShopBundlePreview(
        line.item,
        line.coverageItem!,
        line.attachCoverageBonus,
      )
    : attach
      ? formatShopAttachPreview(line.item, line.attachCoverageBonus)
      : line.item.description?.trim() ?? null;

  const costLabel = formatShopLineCost(line);
  const detailItem = bundle ? line.coverageItem! : line.item;

  return (
    <li className="rounded-md border border-border/70 px-2 py-1.5">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium leading-snug">{label}</p>
          {bundle ? (
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-primary/80">
              Peça + cobertura
            </p>
          ) : attach ? (
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-primary/80">
              Cobertura no inventário
            </p>
          ) : null}
          {preview ? (
            <p
              className={cn(
                "mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground",
              )}
            >
              {preview}
            </p>
          ) : null}
          {costLabel ? (
            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {costLabel}
            </p>
          ) : null}
        </div>
        <ItemCatalogDetailTrigger item={detailItem} className="size-6" />
        <button
          type="button"
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remover"
          onClick={onRemove}
        >
          <TrashIcon className="size-3.5" />
        </button>
      </div>
      {supportsShopLineQuantity(line) ? (
        <div className="mt-1 flex items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onQuantityChange(-1)}
          >
            −
          </Button>
          <span className="font-mono text-xs tabular-nums">{line.quantity}</span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onQuantityChange(1)}
          >
            +
          </Button>
        </div>
      ) : null}
    </li>
  );
}
