"use client";

import type { ArmorSummary } from "@/entities/armor/types";
import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  itemCatalogListQuickHint,
  itemCatalogShopBadges,
  itemCatalogTeaser,
} from "@/features/catalog/item-catalog/lib/item-catalog-meta";
import { isBardingItem } from "@/features/catalog/item-catalog/lib/barding";
import {
  Badge,
  badgeVariantFromTone,
} from "@/shared/design-system/primitives/badge";
import { cn } from "@/shared/lib/utils";

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? trimmed.slice(0, 140)).trim();
}

type BeyondShopListItemInfoProps = {
  item: ItemSummary;
  weapon?: WeaponSummary | null;
  armor?: ArmorSummary | null;
  proficiencyHint?: string | null;
  className?: string;
};

/** Metadados ricos na listagem da loja (chips + dica + teaser). */
export function BeyondShopListItemInfo({
  item,
  weapon,
  armor,
  proficiencyHint,
  className,
}: BeyondShopListItemInfoProps) {
  const badges = itemCatalogShopBadges(item, { weapon, armor });
  const quickHint = itemCatalogListQuickHint(item, { weapon, armor });
  const teaser = itemCatalogTeaser(item);
  const preview = quickHint ?? (teaser ? firstSentence(teaser) : null);
  const emphasizePreview = Boolean(weapon || armor || isBardingItem(item));

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {badges.map((badge) => (
          <Badge
            key={badge.key}
            variant={badgeVariantFromTone(badge.tone)}
            size="sm"
          >
            {badge.label}
          </Badge>
        ))}
      </div>
      {proficiencyHint ? (
        <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          {proficiencyHint}
        </p>
      ) : null}
      {preview ? (
        <p
          className={cn(
            "mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground",
            weapon || armor || emphasizePreview
              ? "font-medium text-foreground/85"
              : undefined,
          )}
        >
          {preview}
        </p>
      ) : null}
    </div>
  );
}
