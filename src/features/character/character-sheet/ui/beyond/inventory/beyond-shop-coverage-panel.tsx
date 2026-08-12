"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { InventoryItem } from "@/entities/character/session-types";
import type { ItemSummary } from "@/entities/item/types";
import {
  baseCatalogItemType,
  catalogItemMatchesCoverage,
  coverageAppliesToKind,
  inventoryHostMatchesCoverage,
  isCoverageItem,
  parseItemCoverageFromSummary,
} from "@/features/character/character-sheet/lib/inventory/coverage-shop";
import {
  coverageBaseCatalogOptionParts,
  coverageInventoryHostOptionParts,
} from "@/features/character/character-sheet/lib/inventory/coverage-base-option-label";
import { useCoverageBaseItems } from "@/features/catalog/item-catalog/api/use-coverage-base-items";
import { useShopEquipmentIndex } from "@/features/catalog/item-catalog/api/use-shop-equipment-index";
import {
  fetchItemBySlug,
  itemKeys,
} from "@/features/catalog/item-catalog/api/items.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

export type CoverageCartPayload = {
  coverage: ItemSummary;
  attachCoverageBonus?: 1 | 2 | 3;
} & (
  | { mode: "existing"; attachToBaseSlug: string }
  | { mode: "bundle"; base: ItemSummary; attachCoverageSlug: string }
);

type BeyondShopCoveragePanelProps = {
  coverageItem: ItemSummary;
  inventoryItems: InventoryItem[];
  shopOpen: boolean;
  onAdd: (payload: CoverageCartPayload) => void;
};

export function BeyondShopCoveragePanel({
  coverageItem,
  inventoryItems,
  shopOpen,
  onAdd,
}: BeyondShopCoveragePanelProps) {
  const needsDetail =
    isCoverageItem(coverageItem) &&
    parseItemCoverageFromSummary(coverageItem) === null;
  const detail = useQuery({
    queryKey: itemKeys.detail(coverageItem.slug),
    queryFn: () => fetchItemBySlug(coverageItem.slug),
    enabled: shopOpen && needsDetail,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
  const effectiveCoverage = detail.data ?? coverageItem;
  const parsed = parseItemCoverageFromSummary(effectiveCoverage);
  const appliesKind = parsed ? coverageAppliesToKind(parsed) : null;

  const [mode, setMode] = useState<"existing" | "bundle">("existing");
  const [attachBase, setAttachBase] = useState("");
  const [bundleBase, setBundleBase] = useState("");
  const [attachBonus, setAttachBonus] = useState<1 | 2 | 3>(1);

  const baseItemType = parsed ? baseCatalogItemType(parsed) : undefined;
  const baseCatalog = useCoverageBaseItems(
    baseItemType ? { itemType: baseItemType } : undefined,
    shopOpen && Boolean(baseItemType),
  );
  const equipmentIndex = useShopEquipmentIndex(shopOpen);

  const inventoryHosts = useMemo(() => {
    if (!parsed) return [];
    return inventoryItems.filter((host) =>
      inventoryHostMatchesCoverage(host, parsed),
    );
  }, [parsed, inventoryItems]);

  const catalogBases = useMemo(() => {
    if (!parsed) return [];
    return (baseCatalog.data?.data ?? []).filter((row) =>
      catalogItemMatchesCoverage(parsed, row),
    );
  }, [baseCatalog.data?.data, parsed]);

  if (!parsed || !appliesKind) {
    return (
      <p className="text-[11px] text-muted-foreground">
        Cobertura especial — aplique na ficha após comprar a peça base.
      </p>
    );
  }

  const canAddExisting = mode === "existing" && Boolean(attachBase);
  const canAddBundle = mode === "bundle" && Boolean(bundleBase);
  const selectedBundle = catalogBases.find((row) => row.slug === bundleBase);

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-52">
      <div className="flex gap-1">
        {(
          [
            ["existing", "Inventário"],
            ["bundle", "Comprar base"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "flex-1 rounded border px-1 py-0.5 text-[10px] font-medium",
              mode === id
                ? "border-primary/50 bg-primary/15"
                : "border-border/70 text-muted-foreground",
            )}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <SearchableSelect
          id={`host-${coverageItem.slug}`}
          size="compact"
          value={attachBase}
          onValueChange={setAttachBase}
          options={inventoryHosts.map((host) => {
            const parts = coverageInventoryHostOptionParts(host, {
              weapon: equipmentIndex.weaponsBySlug?.get(host.itemSlug),
              armor: equipmentIndex.armorBySlug?.get(host.itemSlug),
            });
            return { value: host.itemSlug, ...parts };
          })}
          placeholder={
            inventoryHosts.length > 0 ? "Aplicar em…" : "Sem peça compatível"
          }
        />
      ) : (
        <SearchableSelect
          id={`base-${coverageItem.slug}`}
          size="compact"
          value={bundleBase}
          onValueChange={setBundleBase}
          disabled={baseCatalog.isPending}
          options={catalogBases.map((row) => {
            const parts = coverageBaseCatalogOptionParts(row, {
              weapon: equipmentIndex.weaponsBySlug?.get(row.slug),
              armor: equipmentIndex.armorBySlug?.get(row.slug),
            });
            return { value: row.slug, ...parts };
          })}
          placeholder={
            baseCatalog.isPending ? "Carregando…" : "Peça base…"
          }
          emptyMessage={
            baseCatalog.isPending
              ? "Carregando…"
              : "Nenhuma peça compatível"
          }
        />
      )}

      {parsed.requiresTierBonus ? (
        <div className="flex gap-1">
          {([1, 2, 3] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              className={cn(
                "flex-1 rounded border px-1 py-0.5 text-[11px]",
                attachBonus === tier
                  ? "border-primary/50 bg-primary/15"
                  : "border-border/70",
              )}
              onClick={() => setAttachBonus(tier)}
            >
              +{tier}
            </button>
          ))}
        </div>
      ) : null}

      <Button
        type="button"
        size="xs"
        variant="outline"
        disabled={!(canAddExisting || canAddBundle)}
        onClick={() => {
          if (mode === "existing" && attachBase) {
            onAdd({
              mode: "existing",
              coverage: effectiveCoverage,
              attachToBaseSlug: attachBase,
              attachCoverageBonus: parsed.requiresTierBonus
                ? attachBonus
                : undefined,
            });
            return;
          }
          if (mode === "bundle" && selectedBundle) {
            onAdd({
              mode: "bundle",
              coverage: effectiveCoverage,
              base: selectedBundle,
              attachCoverageSlug: effectiveCoverage.slug,
              attachCoverageBonus: parsed.requiresTierBonus
                ? attachBonus
                : undefined,
            });
          }
        }}
      >
        {mode === "bundle" ? "Base + cobertura" : "Aplicar"}
      </Button>
    </div>
  );
}
