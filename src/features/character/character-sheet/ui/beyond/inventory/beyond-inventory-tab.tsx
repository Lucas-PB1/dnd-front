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
import type { ItemSummary } from "@/entities/item/types";
import {
  useAddInventoryItem,
  useAttachCoverage,
  useAttachWeaponCharm,
  useCharacterInventory,
  useDetachCoverage,
  useDetachWeaponCharm,
  usePatchCharacterWealth,
  usePatchInventoryItem,
  useRemoveInventoryItem,
} from "@/features/character/character-sheet/api/use-character-inventory";
import { readEldritchInvocationSlugs } from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { BeyondCoinPurse, formatCoinPurse, parseCostTextClient, scaleCoinPurseClient } from "@/features/character/character-sheet/ui/beyond/inventory/beyond-coin-purse";
import { MAX_ATTUNED_ITEMS } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import { InventoryLocationSection } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-location-section";
import { QuantityStepper } from "@/features/character/character-sheet/ui/beyond/inventory/quantity-stepper";
import { ItemPicker } from "@/features/catalog/item-catalog/ui/item-picker";
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
import { FieldLabel } from "@/shared/ui/field";

function isAmmunitionInventoryCandidate(item: InventoryItem): boolean {
  const slug = item.itemSlug.toLowerCase();
  const name = item.itemName.toLowerCase();
  if (slug === "municao" || name === "munição" || name === "municao") {
    return true;
  }
  if (
    /aljava|estojo|quiver/.test(slug) ||
    /aljava|estojo/.test(name)
  ) {
    return false;
  }
  return /flecha|virote|municao|munição|bala|agulha|arrow|bolt|bullet|needle/.test(
    `${slug} ${name}`,
  );
}

type BeyondInventoryTabProps = {
  characterId: string;
  equipmentWarnings?: EquipmentWarning[];
  classSlug?: string | null;
  classOptions?: ClassOption[] | null;
};

/**
 * Inventário estilo Beyond: só itens (Equipado / Mochila).
 * Pacotes de criação viram itens no inventário (API).
 */
export function BeyondInventoryTab({
  characterId,
  equipmentWarnings = [],
  classSlug,
  classOptions,
}: BeyondInventoryTabProps) {
  const inventory = useCharacterInventory(characterId);
  const addItem = useAddInventoryItem(characterId);
  const patchItem = usePatchInventoryItem(characterId);
  const patchWealth = usePatchCharacterWealth(characterId);
  const removeItem = useRemoveInventoryItem(characterId);
  const attachCharm = useAttachWeaponCharm(characterId);
  const detachCharm = useDetachWeaponCharm(characterId);
  const attachCoverage = useAttachCoverage(characterId);
  const detachCoverage = useDetachCoverage(characterId);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemSummary | null>(null);
  const [newQty, setNewQty] = useState("1");
  const [skipPayment, setSkipPayment] = useState(false);

  const canBindPactWeapon =
    classSlug === "warlock" &&
    readEldritchInvocationSlugs(classOptions).includes("pact-of-the-blade");

  const items = inventory.data?.items ?? [];
  const wealth = inventory.data?.wealth;
  const payment = inventory.data?.paymentContext;
  const chargeApplies = Boolean(payment?.chargeApplies);
  const canSkipPayment =
    chargeApplies && Boolean(payment?.allowPlayerSkipPayment);

  const equipped = items.filter((item) => item.location === "equipped");
  const backpack = items.filter((item) => item.location === "backpack");
  const attunedCount =
    items.filter((item) => item.attuned).length +
    items.filter((item) => item.attachedCoverageAttuned).length;
  const attunementSlotsFull = attunedCount >= MAX_ATTUNED_ITEMS;
  const isPending =
    patchItem.isPending ||
    patchWealth.isPending ||
    removeItem.isPending ||
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
    .map((item) => ({ value: item.itemSlug, label: item.itemName }));

  function resetAddForm() {
    setSelectedSlug("");
    setSelectedItem(null);
    setNewQty("1");
    setSkipPayment(false);
  }

  const addQuantity = Math.max(1, Math.trunc(Number(newQty)) || 1);

  function setAddQuantity(next: number) {
    setNewQty(String(Math.max(1, Math.trunc(next) || 1)));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlug.trim()) return;
    await addItem.mutateAsync({
      itemSlug: selectedSlug.trim(),
      quantity: addQuantity,
      pay: chargeApplies ? !skipPayment : undefined,
    });
    resetAddForm();
    setAddOpen(false);
  }

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

  const mutationError =
    addItem.error ??
    patchItem.error ??
    patchWealth.error ??
    removeItem.error ??
    attachCharm.error ??
    detachCharm.error ??
    attachCoverage.error ??
    detachCoverage.error ??
    inventory.error;

  const priceNote = selectedItem?.costText
    ? selectedItem.costText
    : selectedItem
      ? "Sem preço de catálogo"
      : null;

  const unitPurse = parseCostTextClient(selectedItem?.costText);
  const totalPurse =
    unitPurse && chargeApplies && !skipPayment
      ? scaleCoinPurseClient(unitPurse, addQuantity)
      : null;
  const totalPriceLabel = totalPurse ? formatCoinPurse(totalPurse) : null;

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
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon className="size-3.5" aria-hidden />
            Adicionar
          </Button>
        </div>
      </div>

      {wealth ? (
        <BeyondCoinPurse
          wealth={wealth}
          disabled={patchWealth.isPending}
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
            isPending={isPending}
            attunementSlotsFull={attunementSlotsFull}
            equipmentWarnings={equipmentWarnings}
            weaponOptions={weaponOptions}
            baseOptions={baseOptions}
            canBindPactWeapon={canBindPactWeapon}
            onToggleLocation={toggleLocation}
            onToggleAttunement={toggleAttunement}
            onPatch={patchFields}
            onRemove={(slug) => removeItem.mutate(slug)}
            onAttachCharm={(weaponSlug, charmSlug) =>
              attachCharm.mutate({ weaponSlug, charmSlug })
            }
            onDetachCharm={(weaponSlug) => detachCharm.mutate(weaponSlug)}
            onAttachCoverage={(baseItemSlug, coverageSlug, bonus, spellSlug) =>
              attachCoverage.mutate({
                baseItemSlug,
                coverageSlug,
                bonus,
                spellSlug,
              })
            }
            onDetachCoverage={(baseItemSlug) =>
              detachCoverage.mutate(baseItemSlug)
            }
            sellCreditApplies={chargeApplies}
          />
          <InventoryLocationSection
            id="backpack"
            title="Mochila"
            icon={ArchiveBoxIcon}
            items={backpack}
            emptyMessage="Mochila vazia — adicione itens do catálogo."
            isPending={isPending}
            attunementSlotsFull={attunementSlotsFull}
            equipmentWarnings={equipmentWarnings}
            weaponOptions={weaponOptions}
            baseOptions={baseOptions}
            canBindPactWeapon={canBindPactWeapon}
            onToggleLocation={toggleLocation}
            onToggleAttunement={toggleAttunement}
            onPatch={patchFields}
            onRemove={(slug) => removeItem.mutate(slug)}
            onAttachCharm={(weaponSlug, charmSlug) =>
              attachCharm.mutate({ weaponSlug, charmSlug })
            }
            onDetachCharm={(weaponSlug) => detachCharm.mutate(weaponSlug)}
            onAttachCoverage={(baseItemSlug, coverageSlug, bonus, spellSlug) =>
              attachCoverage.mutate({
                baseItemSlug,
                coverageSlug,
                bonus,
                spellSlug,
              })
            }
            onDetachCoverage={(baseItemSlug) =>
              detachCoverage.mutate(baseItemSlug)
            }
            sellCreditApplies={chargeApplies}
          />
        </div>
      )}

      {mutationError ? (
        <p className="text-sm text-destructive" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : "Erro no inventário"}
        </p>
      ) : null}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
          <form
            onSubmit={handleAdd}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
          >
            <DialogHeader>
              <DialogTitle>Adicionar item</DialogTitle>
              <DialogDescription>
                {chargeApplies
                  ? "O preço do catálogo será debitado das suas moedas."
                  : payment?.viewerIsDmOrAssistant
                    ? "Presente do mestre — sem cobrança."
                    : "Filtre o catálogo e escolha um item para a mochila."}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-hidden">
              <ItemPicker
                id="inventory-item"
                value={selectedSlug}
                onChange={setSelectedSlug}
                onItemChange={setSelectedItem}
                disabled={addItem.isPending}
              />
            </div>

            {priceNote ? (
              <p className="font-mono text-xs text-muted-foreground">
                Preço: {priceNote}
                {addQuantity > 1 && selectedItem?.costText
                  ? ` × ${addQuantity}`
                  : ""}
                {totalPriceLabel
                  ? ` → debitar ${totalPriceLabel} (com câmbio)`
                  : ""}
              </p>
            ) : null}

            {chargeApplies ? (
              <p className="text-[11px] text-muted-foreground">
                Remover item na campanha vende por metade do catálogo (PHB).
              </p>
            ) : null}

            {canSkipPayment ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={skipPayment}
                  onChange={(e) => setSkipPayment(e.target.checked)}
                  disabled={addItem.isPending}
                />
                Não pagar
              </label>
            ) : null}

            <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                <FieldLabel htmlFor="item-qty" className="shrink-0">
                  Quantidade
                </FieldLabel>
                <QuantityStepper
                  id="item-qty"
                  value={newQty}
                  onChange={setNewQty}
                  onCommit={setAddQuantity}
                  disabled={addItem.isPending}
                  ariaLabel="Quantidade a adicionar"
                />
              </div>
              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  disabled={addItem.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={addItem.isPending || !selectedSlug.trim()}
                >
                  {addItem.isPending
                    ? "Adicionando…"
                    : addQuantity > 1
                      ? `Adicionar ×${addQuantity}`
                      : "Adicionar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
