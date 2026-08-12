"use client";

import type { ArmorSummary } from "@/entities/armor/types";
import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  armorEquipmentStats,
  weaponEquipmentStats,
  weaponTraitLines,
} from "@/features/catalog/item-catalog/lib/item-catalog-equipment-stats";
import {
  itemCatalogStats,
  itemCatalogTypeLabel,
} from "@/features/catalog/item-catalog/lib/item-catalog-meta";
import { PhbProse } from "@/shared/ui/phb-prose";
import { cn } from "@/shared/lib/utils";

type ItemCatalogDetailContentProps = {
  item: ItemSummary;
  weapon?: WeaponSummary;
  armor?: ArmorSummary;
  equipmentPending?: boolean;
  isLoading?: boolean;
  /** Preview de 2 linhas na listagem da loja. */
  compact?: boolean;
  className?: string;
};

function resolveStats(
  item: ItemSummary,
  weapon?: WeaponSummary,
  armor?: ArmorSummary,
) {
  if (weapon) return weaponEquipmentStats(weapon);
  if (armor) return armorEquipmentStats(armor);
  return itemCatalogStats(item);
}

export function ItemCatalogDetailContent({
  item,
  weapon,
  armor,
  equipmentPending = false,
  isLoading = false,
  compact = false,
  className,
}: ItemCatalogDetailContentProps) {
  const props = item.properties;
  const header =
    typeof props?.header === "string" ? props.header.trim() : null;
  const rarityLabel =
    typeof props?.rarityLabel === "string" ? props.rarityLabel.trim() : null;
  const description = item.description?.trim() ?? "";
  const stats = resolveStats(item, weapon, armor);
  const traitLines = weapon ? weaponTraitLines(weapon) : [];

  if (isLoading || equipmentPending) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Carregando detalhes…
      </p>
    );
  }

  if (compact) {
    const teaser =
      description ||
      header ||
      stats.find((row) => row.label === "Dano")?.value ||
      stats.find((row) => row.label === "CA")?.value ||
      stats.find((row) => row.label === "Propriedades")?.value;
    if (!teaser) return null;
    return (
      <p
        className={cn(
          "line-clamp-2 text-xs leading-relaxed text-muted-foreground",
          className,
        )}
      >
        {teaser}
      </p>
    );
  }

  const eyebrow = [
    props?.magic === true ? "Item mágico" : null,
    rarityLabel,
    itemCatalogTypeLabel(item),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn("space-y-4", className)}>
      {eyebrow ? (
        <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>
      ) : null}

      {header && header !== rarityLabel ? (
        <p className="text-sm font-medium text-foreground">{header}</p>
      ) : null}

      {stats.length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs">
          {stats.map((stat) => (
            <div key={stat.label} className="contents">
              <dt className="font-medium text-muted-foreground">{stat.label}</dt>
              <dd className="text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {traitLines.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Propriedades e maestria
          </p>
          <div className="space-y-2">
            {traitLines.map((trait) => (
              <div
                key={trait.title}
                className="rounded-md border border-border/70 bg-background/80 px-3 py-2"
              >
                <p className="text-xs font-semibold text-foreground">
                  {trait.title}
                </p>
                <PhbProse
                  text={trait.description}
                  className="mt-1 text-xs leading-relaxed text-muted-foreground [&_p]:text-muted-foreground"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Descrição
        </p>
        {description ? (
          <PhbProse
            text={description}
            className="text-sm leading-relaxed text-foreground/90 [&_p]:text-foreground/90"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem texto descritivo adicional — use as estatísticas acima.
          </p>
        )}
      </div>
    </div>
  );
}

/** Modal aninhado (loja/ficha): overlay mais escuro e painel com mais contraste. */
export const ITEM_CATALOG_DETAIL_DIALOG_CLASS =
  "border-2 border-primary/35 bg-card shadow-2xl ring-2 ring-black/25 sm:max-w-xl";
export const ITEM_CATALOG_DETAIL_DIALOG_OVERLAY_CLASS =
  "z-[60] bg-black/75 supports-backdrop-filter:backdrop-blur-sm";
export const ITEM_CATALOG_DETAIL_DIALOG_VIEWPORT_CLASS = "z-[60]";
