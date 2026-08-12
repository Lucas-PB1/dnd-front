"use client";

import { ArchiveBoxIcon, PlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import type { ClassOption } from "@/entities/character/sheet-types";
import type { CoinPurse } from "@/entities/character/types";
import type { EquipmentWarning } from "@/entities/character/types";
import {
  useAttachCoverage,
  useAttachWeaponCharm,
  useCharacterInventory,
  useDetachCoverage,
  useDetachWeaponCharm,
  usePatchCharacterWealth,
  usePatchInventoryItem,
  usePurchaseInventory,
  useRemoveInventoryItem,
} from "@/features/character/character-sheet/api/use-character-inventory";
import { readEldritchInvocationSlugs } from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { BeyondCoinPurse } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-coin-purse";
import { BeyondEconomyBanner } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-economy-banner";
import {
  BeyondShopDialog,
  type BeyondShopCartLine,
} from "@/features/character/character-sheet/ui/beyond/inventory/beyond-shop-dialog";
import { BeyondSellDialog } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-sell-dialog";
import { MAX_ATTUNED_ITEMS } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import { InventoryLocationSection } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-location-section";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

function isAmmunitionInventoryCandidate(item: InventoryItem): boolean {
  const slug = item.itemSlug.toLowerCase();
  const name = item.itemName.toLowerCase();
  if (slug === "municao" || name === "munição" || name === "municao") {
    return true;
  }
  if (/aljava|estojo|quiver/.test(slug) || /aljava|estojo/.test(name)) {
    return false;
  }
  return /flecha|virote|municao|munição|bala|agulha|arrow|bolt|bullet|needle/.test(
    `${slug} ${name}`,
  );
}

function isContainerSlug(slug: string): boolean {
  return /^(mochila|saca|cesta|algibeira|bolsa|estojo|aljava)/i.test(slug);
}

type BeyondInventoryTabProps = {
  characterId: string;
  equipmentWarnings?: EquipmentWarning[];
  classSlug?: string | null;
  classOptions?: ClassOption[] | null;
};

export function BeyondInventoryTab({
  characterId,
  equipmentWarnings = [],
  classSlug,
  classOptions,
}: BeyondInventoryTabProps) {
  const inventory = useCharacterInventory(characterId);
  const purchase = usePurchaseInventory(characterId);
  const patchItem = usePatchInventoryItem(characterId);
  const patchWealth = usePatchCharacterWealth(characterId);
  const removeItem = useRemoveInventoryItem(characterId);
  const attachCharm = useAttachWeaponCharm(characterId);
  const detachCharm = useDetachWeaponCharm(characterId);
  const attachCoverage = useAttachCoverage(characterId);
  const detachCoverage = useDetachCoverage(characterId);

  const [shopOpen, setShopOpen] = useState(false);
  const [sellTarget, setSellTarget] = useState<InventoryItem | null>(null);

  const canBindPactWeapon =
    classSlug === "warlock" &&
    readEldritchInvocationSlugs(classOptions).includes("pact-of-the-blade");

  const items = inventory.data?.items ?? [];
  const wealth = inventory.data?.wealth;
  const payment = inventory.data?.paymentContext;
  const chargeApplies = Boolean(payment?.chargeApplies);
  const canSkipPayment =
    chargeApplies && Boolean(payment?.allowPlayerSkipPayment);

  const rootItems = items.filter((item) => !item.containedInItemSlug);
  const equipped = rootItems.filter((item) => item.location === "equipped");
  const backpack = rootItems.filter((item) => item.location === "backpack");
  const containers = backpack.filter((item) => isContainerSlug(item.itemSlug));

  const attunedCount =
    items.filter((item) => item.attuned).length +
    items.filter((item) => item.attachedCoverageAttuned).length;
  const attunementSlotsFull = attunedCount >= MAX_ATTUNED_ITEMS;
  const isPending =
    patchItem.isPending ||
    patchWealth.isPending ||
    removeItem.isPending ||
    purchase.isPending ||
    attachCharm.isPending ||
    detachCharm.isPending ||
    attachCoverage.isPending ||
    detachCoverage.isPending;

  const weaponOptions = items
    .filter((item) => item.itemType === "weapon" && !item.isCoverage)
    .map((item) => ({ value: item.itemSlug, label: item.itemName }));
  const baseOptions = items
    .filter(
      (item) =>
        !item.isCoverage &&
        (item.itemType === "weapon" ||
          item.itemType === "armor" ||
          isAmmunitionInventoryCandidate(item)),
    )
    .map((item) => ({
      value: item.itemSlug,
      label: item.itemName,
      itemType: item.itemType,
      equipmentSlot: item.equipmentSlot,
    }));
  const containerOptions = containers.map((item) => ({
    value: item.itemSlug,
    label: item.itemName,
  }));

  function patchFields(slug: string, payload: PatchInventoryItemPayload) {
    patchItem.mutate({ itemSlug: slug, payload });
  }

  function toggleLocation(item: InventoryItem) {
    patchFields(item.itemSlug, {
      location: item.location === "equipped" ? "backpack" : "equipped",
    });
  }

  function toggleAttunement(item: InventoryItem) {
    if (!item.requiresAttunement) return;
    if (!item.attuned && attunementSlotsFull) return;
    if (item.attuned && item.cursed && !item.curseBroken) return;
    patchFields(item.itemSlug, { attuned: !item.attuned });
  }

  function onChangeCoin(key: keyof CoinPurse, value: number) {
    patchWealth.mutate({ [key]: value });
  }

  async function handleCheckout(input: {
    lines: BeyondShopCartLine[];
    pay: boolean;
  }) {
    await purchase.mutateAsync({
      pay: input.pay,
      lines: input.lines.map((line) => {
        if (line.attachCoverageSlug) {
          return {
            itemSlug: line.item.slug,
            quantity: line.quantity,
            attachCoverageSlug: line.attachCoverageSlug,
            attachCoverageBonus: line.attachCoverageBonus,
          };
        }
        return {
          itemSlug: line.item.slug,
          quantity: line.quantity,
          attachToBaseSlug: line.attachToBaseSlug,
          attachCoverageBonus: line.attachCoverageBonus,
        };
      }),
    });
  }

  const mutationError =
    purchase.error ??
    patchItem.error ??
    patchWealth.error ??
    removeItem.error ??
    attachCharm.error ??
    detachCharm.error ??
    attachCoverage.error ??
    detachCoverage.error ??
    inventory.error;

  const sectionProps = {
    isPending,
    attunementSlotsFull,
    equipmentWarnings,
    weaponOptions,
    baseOptions,
    containerOptions,
    canBindPactWeapon,
    onToggleLocation: toggleLocation,
    onToggleAttunement: toggleAttunement,
    onPatch: patchFields,
    onRemove: (slug: string) => {
      const item = items.find((row) => row.itemSlug === slug);
      if (item && chargeApplies) {
        setSellTarget(item);
        return;
      }
      removeItem.mutate({ itemSlug: slug, options: { mode: "discard" } });
    },
    onAttachCharm: (weaponSlug: string, charmSlug: string) =>
      attachCharm.mutate({ weaponSlug, charmSlug }),
    onDetachCharm: (weaponSlug: string) => detachCharm.mutate(weaponSlug),
    onAttachCoverage: (
      baseItemSlug: string,
      coverageSlug: string,
      bonus?: 1 | 2 | 3,
      spellSlug?: string,
    ) =>
      attachCoverage.mutate({
        baseItemSlug,
        coverageSlug,
        bonus,
        spellSlug,
      }),
    onDetachCoverage: (baseItemSlug: string) =>
      detachCoverage.mutate(baseItemSlug),
    sellCreditApplies: chargeApplies,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold tracking-tight">
          Inventário
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              attunementSlotsFull
                ? "text-secondary"
                : "text-muted-foreground",
            )}
            title="Itens mágicos sintonizados"
          >
            Sintonia {attunedCount}/{MAX_ATTUNED_ITEMS}
          </span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="gap-1"
            onClick={() => setShopOpen(true)}
          >
            <PlusIcon className="size-3.5" aria-hidden />
            {chargeApplies ? "Comprar" : "Adicionar"}
          </Button>
        </div>
      </div>

      <BeyondEconomyBanner payment={payment} />

      {wealth ? (
        <BeyondCoinPurse
          wealth={wealth}
          disabled={patchWealth.isPending}
          readOnly={chargeApplies}
          onChangeCoin={onChangeCoin}
        />
      ) : null}

      {inventory.data?.encumbrance ? (
        <p
          className={cn(
            "rounded-md border px-3 py-2 text-xs tabular-nums",
            inventory.data.encumbrance.encumbered
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border/70 bg-muted/30 text-muted-foreground",
          )}
          role={inventory.data.encumbrance.encumbered ? "status" : undefined}
        >
          Carga {inventory.data.encumbrance.totalWeightKg} /{" "}
          {inventory.data.encumbrance.carryingCapacityKg} kg
          {inventory.data.encumbrance.encumbered
            ? " — capacidade excedida (Força × 7,5)"
            : ""}
        </p>
      ) : null}

      {inventory.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando inventário…</p>
      ) : (
        <div className="space-y-5">
          <InventoryLocationSection
            id="equipped"
            title="Equipado"
            icon={ShieldCheckIcon}
            items={equipped}
            emptyMessage="Nada equipado — equipe algo da mochila."
            {...sectionProps}
          />
          <InventoryLocationSection
            id="backpack"
            title="Mochila"
            icon={ArchiveBoxIcon}
            items={backpack}
            emptyMessage="Mochila vazia — compre ou adicione itens."
            {...sectionProps}
          />
          {containers.map((container) => {
            const nested = items.filter(
              (item) => item.containedInItemSlug === container.itemSlug,
            );
            return (
              <InventoryLocationSection
                key={container.itemSlug}
                id={`container-${container.itemSlug}`}
                title={container.itemName}
                icon={ArchiveBoxIcon}
                items={nested}
                emptyMessage="Vazio — mova itens para este recipiente no detalhe."
                {...sectionProps}
              />
            );
          })}
        </div>
      )}

      {mutationError ? (
        <p className="text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Erro no inventário"}
        </p>
      ) : null}

      <BeyondShopDialog
        open={shopOpen}
        onOpenChange={setShopOpen}
        chargeApplies={chargeApplies}
        canSkipPayment={canSkipPayment}
        viewerIsDmOrAssistant={Boolean(payment?.viewerIsDmOrAssistant)}
        wealth={wealth}
        inventoryItems={items}
        pending={purchase.isPending}
        onCheckout={handleCheckout}
      />

      <BeyondSellDialog
        item={sellTarget}
        open={sellTarget != null}
        onOpenChange={(open) => {
          if (!open) setSellTarget(null);
        }}
        pending={removeItem.isPending}
        onConfirm={async ({ quantity, mode }) => {
          if (!sellTarget) return;
          await removeItem.mutateAsync({
            itemSlug: sellTarget.itemSlug,
            options: { quantity, mode },
          });
          setSellTarget(null);
        }}
      />
    </div>
  );
}
