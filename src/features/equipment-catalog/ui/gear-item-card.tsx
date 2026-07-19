import Link from "next/link";

import type { ItemSummary } from "@/entities/item/types";
import { ITEM_TYPE_LABELS_PT } from "@/entities/item/types";
import { cn } from "@/shared/lib/utils";

type GearItemCardProps = {
  item: ItemSummary;
  className?: string;
};

export function GearItemCard({ item, className }: GearItemCardProps) {
  const typeLabel = ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;

  return (
    <Link
      href={`/equipment/items/${item.slug}`}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
          {item.name}
        </h2>
        <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
          {typeLabel}
        </p>
      </div>
      <div className="shrink-0 space-y-0.5 text-xs text-muted-foreground sm:max-w-40 sm:text-right">
        {item.costText ? <p>{item.costText}</p> : null}
        {item.weight ? <p>{item.weight}</p> : null}
      </div>
    </Link>
  );
}
