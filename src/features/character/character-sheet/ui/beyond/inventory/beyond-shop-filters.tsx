"use client";

import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { editionMenuLabel } from "@/entities/edition/catalog-sources";
import { editionsKeys, fetchEditions } from "@/entities/edition/api";
import { SHOP_KIND_CHIPS } from "@/entities/item/types";
import {
  countActiveShopAdvancedFilters,
  EMPTY_SHOP_ADVANCED_FILTERS,
  SHOP_ATTUNEMENT_FILTER,
  SHOP_SORT_FILTER,
  shopAdvancedFilterLabels,
  clearShopAdvancedFilterKey,
  type ShopAdvancedFilters,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-filter-options";
import { MAGIC_ITEM_RARITY_FILTER } from "@/shared/lib/catalog-filter-options";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type BeyondShopFiltersProps = {
  open: boolean;
  chipId: string;
  onChipChange: (chipId: string) => void;
  hasCostOnly: boolean;
  onHasCostOnlyChange: (value: boolean) => void;
  advanced: ShopAdvancedFilters;
  onAdvancedChange: (next: ShopAdvancedFilters) => void;
};

export function BeyondShopFilters({
  open,
  chipId,
  onChipChange,
  hasCostOnly,
  onHasCostOnlyChange,
  advanced,
  onAdvancedChange,
}: BeyondShopFiltersProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const editions = useQuery({
    queryKey: editionsKeys.all,
    queryFn: fetchEditions,
    enabled: open,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });

  const editionOptions = useMemo(
    () =>
      (editions.data ?? []).map((edition) => ({
        value: edition.slug,
        label: editionMenuLabel(edition),
      })),
    [editions.data],
  );

  const editionLabel = editionOptions.find(
    (row) => row.value === advanced.editionSlug,
  )?.label;

  const activeCount = countActiveShopAdvancedFilters(advanced, hasCostOnly);
  const chips = shopAdvancedFilterLabels(advanced, hasCostOnly, editionLabel);

  function patchAdvanced(patch: Partial<ShopAdvancedFilters>) {
    onAdvancedChange({ ...advanced, ...patch });
  }

  function setAdvancedField(key: string, value: string) {
    if (key === "sort") {
      patchAdvanced({ sort: value as ShopAdvancedFilters["sort"] });
      return;
    }
    if (key === "requiresAttunement") {
      patchAdvanced({
        requiresAttunement: value as ShopAdvancedFilters["requiresAttunement"],
      });
      return;
    }
    if (key === "rarity") {
      patchAdvanced({ rarity: value });
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="Categorias"
        className="flex flex-wrap gap-1.5"
      >
        {SHOP_KIND_CHIPS.map((filter) => {
          const active = chipId === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChipChange(filter.id)}
              className={cn(
                "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary/50 bg-primary/15 text-foreground"
                  : "border-border/70 bg-background/40 text-muted-foreground hover:bg-muted/50",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-[9.5rem] flex-1 flex-col gap-1 sm:max-w-[11rem]">
          <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Ordenar
          </span>
          <SearchableSelect
            id="shop-sort"
            value={advanced.sort}
            className="h-8 text-xs"
            options={[
              { value: "", label: "Nome (A–Z)" },
              ...SHOP_SORT_FILTER.options,
            ]}
            placeholder="Nome (A–Z)"
            onValueChange={(next) => setAdvancedField("sort", next)}
          />
        </label>

        <Button
          type="button"
          size="sm"
          variant={panelOpen || activeCount > 0 ? "secondary" : "outline"}
          className="mt-4 h-8 gap-1.5 text-xs"
          onClick={() => setPanelOpen((value) => !value)}
        >
          <AdjustmentsHorizontalIcon className="size-3.5" aria-hidden />
          Filtros
          {activeCount > 0 ? (
            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] tabular-nums">
              {activeCount}
            </span>
          ) : null}
        </Button>

        {activeCount > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-4 h-8 text-xs text-muted-foreground"
            onClick={() => {
              onAdvancedChange(EMPTY_SHOP_ADVANCED_FILTERS);
              onHasCostOnlyChange(false);
            }}
          >
            Limpar
          </Button>
        ) : null}
      </div>

      {panelOpen ? (
        <div className="rounded-md border border-border/70 bg-muted/15 p-3">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Filtros avançados
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Fonte
              </span>
              <SearchableSelect
                id="shop-edition"
                value={advanced.editionSlug}
                className="h-9 text-xs"
                disabled={editions.isPending}
                options={[
                  { value: "", label: "Todas as fontes" },
                  ...editionOptions,
                ]}
                placeholder={
                  editions.isPending ? "Carregando…" : "Todas as fontes"
                }
                onValueChange={(next) => patchAdvanced({ editionSlug: next })}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                {MAGIC_ITEM_RARITY_FILTER.label}
              </span>
              <SearchableSelect
                id="shop-rarity"
                value={advanced.rarity}
                className="h-9 text-xs"
                options={[
                  { value: "", label: "Todas" },
                  ...MAGIC_ITEM_RARITY_FILTER.options,
                ]}
                placeholder="Todas"
                onValueChange={(next) => setAdvancedField("rarity", next)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                {SHOP_ATTUNEMENT_FILTER.label}
              </span>
              <SearchableSelect
                id="shop-attunement"
                value={advanced.requiresAttunement}
                className="h-9 text-xs"
                options={[
                  { value: "", label: "Todas" },
                  ...SHOP_ATTUNEMENT_FILTER.options,
                ]}
                placeholder="Todas"
                onValueChange={(next) =>
                  setAdvancedField("requiresAttunement", next)
                }
              />
            </label>

            <div className="flex flex-col gap-2 sm:justify-end">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={hasCostOnly}
                  onChange={(event) =>
                    onHasCostOnlyChange(event.target.checked)
                  }
                />
                Só itens com preço
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={advanced.coverageOnly}
                  onChange={(event) =>
                    patchAdvanced({ coverageOnly: event.target.checked })
                  }
                />
                Só coberturas (DMG)
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted/40"
              onClick={() => {
                if (chip.key === "hasCostOnly") {
                  onHasCostOnlyChange(false);
                  return;
                }
                onAdvancedChange(clearShopAdvancedFilterKey(advanced, chip.key));
              }}
            >
              {chip.label}
              <XMarkIcon className="size-3" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { EMPTY_SHOP_ADVANCED_FILTERS, type ShopAdvancedFilters };
