"use client";

import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useMemo, useRef, useState } from "react";

import type { CoinPurse } from "@/entities/character/types";
import type { InventoryItem } from "@/entities/character/session-types";
import {
  SHOP_KIND_CHIPS,
  type ItemSummary,
} from "@/entities/item/types";
import {
  formatCoinPurse,
  parseCostTextClient,
  purseToCopperClient,
  scaleCoinPurseClient,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-coin-purse";
import {
  BeyondShopCoveragePanel,
  type CoverageCartPayload,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-coverage-panel";
import { isCoverageItem } from "@/features/character/character-sheet/lib/inventory/coverage-shop";
import type { BeyondShopCartLine } from "@/features/character/character-sheet/lib/inventory/beyond-shop-cart-line";
import {
  isPlainShopLine,
  shopCartLineKey,
} from "@/features/character/character-sheet/lib/inventory/beyond-shop-cart-line";
import { resolveCoverageShopCostText } from "@/features/character/character-sheet/lib/inventory/coverage-tier-cost";
import {
  BeyondShopFilters,
  EMPTY_SHOP_ADVANCED_FILTERS,
  type ShopAdvancedFilters,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-filters";
import {
  useAllItems,
  usePopularItems,
} from "@/features/catalog/item-catalog/api/use-items";
import { useShopEquipmentIndex } from "@/features/catalog/item-catalog/api/use-shop-equipment-index";
import { ItemCatalogDetailTrigger } from "@/features/catalog/item-catalog/ui/item-catalog-detail-trigger";
import { BeyondShopCartLineRow } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-cart-line-row";
import { BeyondShopListItemInfo } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-list-item-info";
import { recordItemView } from "@/features/catalog/item-catalog/api/items.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

export type { BeyondShopCartLine } from "@/features/character/character-sheet/lib/inventory/beyond-shop-cart-line";

type BeyondShopDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chargeApplies: boolean;
  canSkipPayment: boolean;
  viewerIsDmOrAssistant: boolean;
  wealth: CoinPurse | undefined;
  inventoryItems: InventoryItem[];
  pending: boolean;
  onCheckout: (input: {
    lines: BeyondShopCartLine[];
    pay: boolean;
  }) => Promise<void>;
};

/** Modal fluido Beyond: catálogo + filtros + carrinho + checkout. */
export function BeyondShopDialog({
  open,
  onOpenChange,
  chargeApplies,
  canSkipPayment,
  viewerIsDmOrAssistant,
  wealth,
  inventoryItems,
  pending,
  onCheckout,
}: BeyondShopDialogProps) {
  const [search, setSearch] = useState("");
  const [chipId, setChipId] = useState("all");
  const [hasCostOnly, setHasCostOnly] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ShopAdvancedFilters>(
    EMPTY_SHOP_ADVANCED_FILTERS,
  );
  const [cart, setCart] = useState<BeyondShopCartLine[]>([]);
  const [skipPayment, setSkipPayment] = useState(false);
  const viewed = useRef(new Set<string>());
  const { accessToken } = useGameAuth("/characters");
  const debouncedSearch = useDebouncedValue(search, 300);

  const chip = SHOP_KIND_CHIPS.find((c) => c.id === chipId) ?? SHOP_KIND_CHIPS[0];
  const itemKind = advancedFilters.coverageOnly ? "coverage" : chip.kind;

  const itemsQuery = useAllItems(
    {
      q: debouncedSearch.trim() || undefined,
      itemType: chip.itemType,
      kind: itemKind,
      consumable: chip.consumable,
      magic: chip.magic === null || chip.magic === undefined ? undefined : chip.magic,
      rarity: advancedFilters.rarity || undefined,
      editionSlugs: advancedFilters.editionSlug || undefined,
      requiresAttunement:
        advancedFilters.requiresAttunement === "true"
          ? true
          : advancedFilters.requiresAttunement === "false"
            ? false
            : undefined,
      sort: advancedFilters.sort || undefined,
      hasCost: hasCostOnly || chargeApplies ? true : undefined,
    },
    open,
  );

  const tips = usePopularItems("purchase", 5, open);
  const equipmentIndex = useShopEquipmentIndex(open);

  const items = itemsQuery.data?.data ?? [];
  const mustPay = chargeApplies && !skipPayment;

  const checkoutTotal = useMemo(() => {
    let acc: CoinPurse | null = null;
    const addPurse = (next: CoinPurse | null) => {
      if (!next) return;
      if (!acc) {
        acc = { ...next };
        return;
      }
      acc = {
        copper: acc.copper + next.copper,
        silver: acc.silver + next.silver,
        electrum: acc.electrum + next.electrum,
        gold: acc.gold + next.gold,
        platinum: acc.platinum + next.platinum,
      };
    };
    const addLineCost = (
      costText: string | null | undefined,
      quantity: number,
    ) => {
      const unit = parseCostTextClient(costText);
      if (!unit) return;
      addPurse(scaleCoinPurseClient(unit, quantity));
    };
    for (const line of cart) {
      if (line.attachCoverageSlug && line.coverageItem) {
        addLineCost(line.item.costText, line.quantity);
        addLineCost(
          resolveCoverageShopCostText(
            line.coverageItem,
            line.attachCoverageBonus,
          ),
          line.quantity,
        );
        continue;
      }
      if (line.attachToBaseSlug) {
        addLineCost(
          resolveCoverageShopCostText(line.item, line.attachCoverageBonus),
          line.quantity,
        );
        continue;
      }
      addLineCost(line.item.costText, line.quantity);
    }
    return acc;
  }, [cart]);

  const wealthCopper = wealth ? purseToCopperClient(wealth) : 0;
  const totalCopper = checkoutTotal
    ? purseToCopperClient(checkoutTotal)
    : 0;
  const insufficient = mustPay && totalCopper > wealthCopper;

  function resetShopState() {
    setCart([]);
    setSkipPayment(false);
    setSearch("");
    setChipId("all");
    setHasCostOnly(false);
    setAdvancedFilters(EMPTY_SHOP_ADVANCED_FILTERS);
    viewed.current.clear();
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetShopState();
    }
    onOpenChange(next);
  }

  function markViewed(slug: string) {
    if (!accessToken || viewed.current.has(slug)) return;
    viewed.current.add(slug);
    void recordItemView(accessToken, slug).catch(() => undefined);
  }

  function addToCart(item: ItemSummary) {
    if (isCoverageItem(item)) return;
    markViewed(item.slug);
    setCart((prev) => {
      const existing = prev.find(
        (line) => isPlainShopLine(line) && line.item.slug === item.slug,
      );
      if (existing) {
        return prev.map((line) =>
          shopCartLineKey(line) === shopCartLineKey(existing)
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function addCoverageToCart(payload: CoverageCartPayload) {
    markViewed(payload.coverage.slug);
    if (payload.mode === "existing") {
      const nextLine: BeyondShopCartLine = {
        item: payload.coverage,
        quantity: 1,
        attachToBaseSlug: payload.attachToBaseSlug,
        attachCoverageBonus: payload.attachCoverageBonus,
      };
      setCart((prev) => [
        ...prev.filter((line) => shopCartLineKey(line) !== shopCartLineKey(nextLine)),
        nextLine,
      ]);
      return;
    }
    const nextLine: BeyondShopCartLine = {
      item: payload.base,
      quantity: 1,
      attachCoverageSlug: payload.attachCoverageSlug,
      attachCoverageBonus: payload.attachCoverageBonus,
      coverageItem: payload.coverage,
    };
    setCart((prev) => {
      const existing = prev.find(
        (line) => shopCartLineKey(line) === shopCartLineKey(nextLine),
      );
      if (existing) {
        return prev.map((line) =>
          shopCartLineKey(line) === shopCartLineKey(existing)
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, nextLine];
    });
  }

  async function handleCheckout() {
    if (cart.length === 0 || insufficient) return;
    await onCheckout({
      lines: cart,
      pay: chargeApplies ? !skipPayment : true,
    });
    handleOpenChange(false);
  }

  const title = chargeApplies ? "Comprar" : "Adicionar à mochila";
  const modeHint = chargeApplies
    ? "Economia ativa — o total será debitado do saldo."
    : viewerIsDmOrAssistant
      ? "Modo mestre — sem débito."
      : "Sem cobrança — itens entram de graça.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(92vh,52rem)] w-full max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="shrink-0 border-b border-border/70 px-4 py-3 pr-12">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{modeHint}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1fr_18rem]">
          <div className="flex min-h-0 flex-col gap-3 overflow-hidden border-b border-border/70 p-4 md:border-r md:border-b-0">
            <label className="relative block">
              <span className="sr-only">Buscar item</span>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome…"
                className="pl-9"
                autoComplete="off"
              />
            </label>

            <BeyondShopFilters
              open={open}
              chipId={chipId}
              onChipChange={setChipId}
              hasCostOnly={hasCostOnly}
              onHasCostOnlyChange={setHasCostOnly}
              advanced={advancedFilters}
              onAdvancedChange={setAdvancedFilters}
            />

            {tips.data && tips.data.length > 0 ? (
              <div className="rounded-md border border-border/60 bg-muted/20 px-2 py-1.5">
                <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                  Sugestões (mais comprados)
                </p>
                <div className="flex flex-wrap gap-1">
                  {tips.data.map((tip) => (
                    <button
                      key={tip.slug}
                      type="button"
                      className="rounded border border-border/70 px-1.5 py-0.5 text-[11px] hover:bg-muted/50"
                      onClick={() =>
                        isCoverageItem(tip) ? undefined : addToCart(tip)
                      }
                      disabled={isCoverageItem(tip)}
                    >
                      {tip.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/70">
              {itemsQuery.isPending ? (
                <p className="p-3 text-xs text-muted-foreground">Carregando…</p>
              ) : items.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground">
                  Nenhum resultado
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {items.map((item) => {
                    const coverage = isCoverageItem(item);
                    return (
                      <li key={item.slug}>
                        <div className="flex items-start gap-2 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-0.5">
                              <button
                                type="button"
                                className="min-w-0 flex-1 text-left"
                                onClick={() => markViewed(item.slug)}
                              >
                                <p className="truncate text-sm font-medium">
                                  {item.name}
                                </p>
                                <BeyondShopListItemInfo
                                  item={item}
                                  weapon={equipmentIndex.weaponsBySlug?.get(
                                    item.slug,
                                  )}
                                  armor={equipmentIndex.armorBySlug?.get(
                                    item.slug,
                                  )}
                                />
                              </button>
                              <ItemCatalogDetailTrigger item={item} />
                            </div>
                          </div>
                          {coverage ? (
                            <BeyondShopCoveragePanel
                              coverageItem={item}
                              inventoryItems={inventoryItems}
                              shopOpen={open}
                              onAdd={addCoverageToCart}
                            />
                          ) : (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              className="shrink-0 gap-1"
                              onClick={() => addToCart(item)}
                            >
                              <PlusIcon className="size-3.5" aria-hidden />
                              Carrinho
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <aside className="flex min-h-0 flex-col gap-2 p-4">
            <p className="text-xs font-medium">Carrinho</p>
            {cart.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Vazio — adicione itens da lista.
              </p>
            ) : (
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {cart.map((line) => {
                  const lineKey = shopCartLineKey(line);
                  return (
                    <BeyondShopCartLineRow
                      key={lineKey}
                      line={line}
                      inventoryItems={inventoryItems}
                      onRemove={() =>
                        setCart((prev) =>
                          prev.filter((c) => shopCartLineKey(c) !== lineKey),
                        )
                      }
                      onQuantityChange={(delta) =>
                        setCart((prev) =>
                          prev.map((c) =>
                            shopCartLineKey(c) === lineKey
                              ? {
                                  ...c,
                                  quantity: Math.max(1, c.quantity + delta),
                                }
                              : c,
                          ),
                        )
                      }
                    />
                  );
                })}
              </ul>
            )}

            {canSkipPayment ? (
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={skipPayment}
                  onChange={(e) => setSkipPayment(e.target.checked)}
                />
                Não pagar
              </label>
            ) : null}

            <div className="mt-auto space-y-1 border-t border-border/70 pt-2">
              <p className="font-mono text-xs tabular-nums">
                Total:{" "}
                {checkoutTotal
                  ? formatCoinPurse(checkoutTotal)
                  : mustPay
                    ? "—"
                    : "grátis"}
              </p>
              {insufficient ? (
                <p className="text-[11px] text-destructive">
                  Saldo insuficiente
                </p>
              ) : null}
            </div>
          </aside>
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 gap-3 border-t border-border/70 px-4 py-3 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            className="px-4"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="px-4"
            disabled={cart.length === 0 || pending || insufficient}
            onClick={() => void handleCheckout()}
          >
            {chargeApplies ? "Fechar compra" : "Adicionar à mochila"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
