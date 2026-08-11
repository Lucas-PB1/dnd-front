"use client";

import { MagnifyingGlassIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CoinPurse } from "@/entities/character/types";
import type { InventoryItem } from "@/entities/character/session-types";
import {
  ITEM_TYPE_LABELS_PT,
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
  useItems,
  usePopularItems,
} from "@/features/catalog/item-catalog/api/use-items";
import { recordItemView } from "@/features/catalog/item-catalog/api/items.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { cn } from "@/shared/lib/utils";
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
import { SearchableSelect } from "@/shared/ui/searchable-select";

export type BeyondShopCartLine = {
  item: ItemSummary;
  quantity: number;
  attachToBaseSlug?: string;
  attachCoverageBonus?: 1 | 2 | 3;
};

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

function coverageAppliesTo(
  item: ItemSummary,
): "weapon" | "armor" | "shield" | null {
  const kind = item.kind ?? item.properties?.kind;
  if (kind !== "coverage") return null;
  const applies = item.properties?.appliesTo;
  if (applies === "weapon" || applies === "armor" || applies === "shield") {
    return applies;
  }
  return null;
}

function hostMatchesCoverage(
  host: InventoryItem,
  appliesTo: "weapon" | "armor" | "shield",
): boolean {
  if (host.isCoverage) return false;
  if (appliesTo === "weapon") return host.itemType === "weapon";
  if (appliesTo === "armor") {
    return host.itemType === "armor" && host.equipmentSlot !== "shield";
  }
  return (
    host.equipmentSlot === "shield" ||
    /escudo|shield/i.test(`${host.itemSlug} ${host.itemName}`)
  );
}

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
  const [cart, setCart] = useState<BeyondShopCartLine[]>([]);
  const [skipPayment, setSkipPayment] = useState(false);
  const [attachBonus, setAttachBonus] = useState<1 | 2 | 3>(1);
  const [attachBase, setAttachBase] = useState("");
  const viewed = useRef(new Set<string>());
  const { accessToken } = useGameAuth("/characters");
  const debouncedSearch = useDebouncedValue(search, 300);

  const chip = SHOP_KIND_CHIPS.find((c) => c.id === chipId) ?? SHOP_KIND_CHIPS[0];

  const itemsQuery = useItems(
    {
      q: debouncedSearch.trim() || undefined,
      itemType: chip.itemType,
      kind: chip.kind,
      consumable: chip.consumable,
      magic: chip.magic === null || chip.magic === undefined ? undefined : chip.magic,
      hasCost: hasCostOnly || chargeApplies ? true : undefined,
      limit: 80,
    },
    open,
  );

  const tips = usePopularItems("purchase", 5, open);

  const items = itemsQuery.data?.data ?? [];
  const mustPay = chargeApplies && !skipPayment;

  const checkoutTotal = useMemo(() => {
    let acc: CoinPurse | null = null;
    for (const line of cart) {
      const unit = parseCostTextClient(line.item.costText);
      if (!unit) continue;
      const scaled = scaleCoinPurseClient(unit, line.quantity);
      if (!scaled) continue;
      if (!acc) {
        acc = { ...scaled };
        continue;
      }
      acc = {
        copper: acc.copper + scaled.copper,
        silver: acc.silver + scaled.silver,
        electrum: acc.electrum + scaled.electrum,
        gold: acc.gold + scaled.gold,
        platinum: acc.platinum + scaled.platinum,
      };
    }
    return acc;
  }, [cart]);

  const wealthCopper = wealth ? purseToCopperClient(wealth) : 0;
  const totalCopper = checkoutTotal
    ? purseToCopperClient(checkoutTotal)
    : 0;
  const insufficient = mustPay && totalCopper > wealthCopper;

  useEffect(() => {
    if (!open) {
      setCart([]);
      setSkipPayment(false);
      setSearch("");
      setChipId("all");
      viewed.current.clear();
    }
  }, [open]);

  function markViewed(slug: string) {
    if (!accessToken || viewed.current.has(slug)) return;
    viewed.current.add(slug);
    void recordItemView(accessToken, slug).catch(() => undefined);
  }

  function addToCart(item: ItemSummary) {
    markViewed(item.slug);
    const applies = coverageAppliesTo(item);
    if (applies) {
      if (!attachBase) return;
      setCart((prev) => [
        ...prev.filter((line) => line.item.slug !== item.slug),
        {
          item,
          quantity: 1,
          attachToBaseSlug: attachBase,
          attachCoverageBonus: attachBonus,
        },
      ]);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((line) => line.item.slug === item.slug);
      if (existing) {
        return prev.map((line) =>
          line.item.slug === item.slug
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  async function handleCheckout() {
    if (cart.length === 0 || insufficient) return;
    await onCheckout({
      lines: cart,
      pay: chargeApplies ? !skipPayment : true,
    });
    onOpenChange(false);
  }

  const title = chargeApplies ? "Comprar" : "Adicionar à mochila";
  const modeHint = chargeApplies
    ? "Economia ativa — o total será debitado do saldo."
    : viewerIsDmOrAssistant
      ? "Modo mestre — sem débito."
      : "Sem cobrança — itens entram de graça.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(92vh,52rem)] w-full max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-border/70 px-4 py-3 pr-12">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{modeHint}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1fr_16rem]">
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
                    onClick={() => setChipId(filter.id)}
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
              <button
                type="button"
                aria-pressed={hasCostOnly}
                onClick={() => setHasCostOnly((v) => !v)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-medium",
                  hasCostOnly
                    ? "border-primary/50 bg-primary/15"
                    : "border-border/70 text-muted-foreground",
                )}
              >
                Tem preço
              </button>
            </div>

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
                      onClick={() => addToCart(tip)}
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
                    const applies = coverageAppliesTo(item);
                    const typeLabel =
                      ITEM_TYPE_LABELS_PT[item.itemType] ?? item.itemType;
                    const kindLabel =
                      item.kind === "service"
                        ? "Serviço"
                        : item.consumable
                          ? "Consumível"
                          : typeLabel;
                    return (
                      <li key={item.slug}>
                        <div className="flex items-start gap-2 px-3 py-2">
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => markViewed(item.slug)}
                          >
                            <p className="truncate text-sm font-medium">
                              {item.name}
                            </p>
                            <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                              {kindLabel}
                              {item.costText ? ` · ${item.costText}` : " · sem preço"}
                              {item.kind === "service"
                                ? " · não vai à mochila"
                                : ""}
                            </p>
                          </button>
                          {applies ? (
                            <div className="flex w-40 shrink-0 flex-col gap-1">
                              <SearchableSelect
                                id={`host-${item.slug}`}
                                value={attachBase}
                                onValueChange={setAttachBase}
                                options={inventoryItems
                                  .filter((host) =>
                                    hostMatchesCoverage(host, applies),
                                  )
                                  .map((host) => ({
                                    value: host.itemSlug,
                                    label: host.itemName,
                                  }))}
                                placeholder="Aplicar em…"
                              />
                              <div className="flex gap-1">
                                {([1, 2, 3] as const).map((tier) => (
                                  <button
                                    key={tier}
                                    type="button"
                                    className={cn(
                                      "rounded border px-1.5 text-[11px]",
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
                              <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                disabled={!attachBase}
                                onClick={() => addToCart(item)}
                              >
                                Aplicar
                              </Button>
                            </div>
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
                {cart.map((line) => (
                  <li
                    key={`${line.item.slug}-${line.attachToBaseSlug ?? ""}`}
                    className="rounded-md border border-border/70 px-2 py-1.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-medium leading-snug">
                        {line.item.name}
                        {line.attachToBaseSlug
                          ? ` → ${line.attachToBaseSlug}`
                          : ""}
                      </p>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remover"
                        onClick={() =>
                          setCart((prev) =>
                            prev.filter((c) => c.item.slug !== line.item.slug),
                          )
                        }
                      >
                        <TrashIcon className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((c) =>
                              c.item.slug === line.item.slug
                                ? {
                                    ...c,
                                    quantity: Math.max(1, c.quantity - 1),
                                  }
                                : c,
                            ),
                          )
                        }
                      >
                        −
                      </Button>
                      <span className="font-mono text-xs tabular-nums">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((c) =>
                              c.item.slug === line.item.slug
                                ? { ...c, quantity: c.quantity + 1 }
                                : c,
                            ),
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  </li>
                ))}
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

        <DialogFooter className="shrink-0 border-t border-border/70 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
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
