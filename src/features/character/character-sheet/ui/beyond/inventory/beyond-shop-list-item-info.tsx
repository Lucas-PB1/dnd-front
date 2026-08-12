"use client";

import type { ArmorSummary } from "@/entities/armor/types";
import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  itemCatalogListQuickHint,
  itemCatalogShopBadges,
  itemCatalogTeaser,
  type ItemCatalogBadgeTone,
} from "@/features/catalog/item-catalog/lib/item-catalog-meta";
import { cn } from "@/shared/lib/utils";

function badgeToneClass(tone: ItemCatalogBadgeTone | undefined): string {
  switch (tone) {
    case "magic":
      return "border-violet-500/40 bg-violet-500/15 text-violet-100";
    case "coverage":
      return "border-amber-500/40 bg-amber-500/15 text-amber-100";
    case "warn":
      return "border-orange-500/40 bg-orange-500/15 text-orange-100";
    case "muted":
      return "border-border/60 bg-muted/30 text-muted-foreground";
    default:
      return "border-border/70 bg-background/60 text-foreground/90";
  }
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? trimmed.slice(0, 140)).trim();
}

type BeyondShopListItemInfoProps = {
  item: ItemSummary;
  weapon?: WeaponSummary | null;
  armor?: ArmorSummary | null;
  className?: string;
};

/** Metadados ricos na listagem da loja (chips + dica + teaser). */
export function BeyondShopListItemInfo({
  item,
  weapon,
  armor,
  className,
}: BeyondShopListItemInfoProps) {
  const badges = itemCatalogShopBadges(item, { weapon, armor });
  const quickHint = itemCatalogListQuickHint(item, { weapon, armor });
  const teaser = itemCatalogTeaser(item);
  const preview = quickHint ?? (teaser ? firstSentence(teaser) : null);

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {badges.map((badge) => (
          <span
            key={badge.key}
            className={cn(
              "inline-flex max-w-full truncate rounded border px-1.5 py-px text-[10px] font-medium leading-tight",
              badgeToneClass(badge.tone),
            )}
          >
            {badge.label}
          </span>
        ))}
      </div>
      {preview ? (
        <p
          className={cn(
            "mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground",
            weapon ? "font-medium text-foreground/85" : undefined,
          )}
        >
          {preview}
        </p>
      ) : null}
    </div>
  );
}
