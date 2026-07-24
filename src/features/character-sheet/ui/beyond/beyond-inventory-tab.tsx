"use client";

import { useState } from "react";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import {
  useAddInventoryItem,
  useCharacterInventory,
  usePatchInventoryItem,
  useRemoveInventoryItem,
} from "@/features/character-sheet/api/use-character-inventory";
import { ItemPicker } from "@/features/item-catalog/ui/item-picker";
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
import { Input } from "@/shared/ui/input";
import { nativeSelectClassName } from "@/shared/ui/native-select";
import { cn } from "@/shared/lib/utils";

const SLOT_OPTIONS = [
  { value: "armor", label: "Armadura" },
  { value: "shield", label: "Escudo" },
  { value: "main_hand", label: "Mão principal" },
  { value: "off_hand", label: "Mão secundária" },
] as const;

type EquipmentSlot = (typeof SLOT_OPTIONS)[number]["value"];

const SLOT_LABELS: Record<string, string> = Object.fromEntries(
  SLOT_OPTIONS.map((o) => [o.value, o.label]),
);

type BeyondInventoryTabProps = {
  characterId: string;
};

/**
 * Inventário estilo Beyond: só itens (Equipado / Mochila).
 * Pacotes de criação viram itens no inventário (API).
 */
export function BeyondInventoryTab({ characterId }: BeyondInventoryTabProps) {
  const inventory = useCharacterInventory(characterId);
  const addItem = useAddInventoryItem(characterId);
  const patchItem = usePatchInventoryItem(characterId);
  const removeItem = useRemoveInventoryItem(characterId);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [newQty, setNewQty] = useState("1");

  const items = inventory.data?.items ?? [];
  const equipped = items.filter((i) => i.location === "equipped");
  const backpack = items.filter((i) => i.location === "backpack");
  const isPending = patchItem.isPending || removeItem.isPending;

  function resetAddForm() {
    setSelectedSlug("");
    setNewQty("1");
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

  const mutationError =
    addItem.error ?? patchItem.error ?? removeItem.error ?? inventory.error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">Inventário</h3>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </span>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => setAddOpen(true)}
          >
            Adicionar
          </Button>
        </div>
      </div>

      {inventory.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando inventário…</p>
      ) : (
        <div className="space-y-4">
          <InventoryLocationSection
            id="equipped"
            title="Equipado"
            items={equipped}
            emptyMessage="Nada equipado."
            isPending={isPending}
            onToggleLocation={toggleLocation}
            onPatch={patchFields}
            onRemove={(slug) => removeItem.mutate(slug)}
          />
          <InventoryLocationSection
            id="backpack"
            title="Mochila"
            items={backpack}
            emptyMessage="Mochila vazia."
            isPending={isPending}
            onToggleLocation={toggleLocation}
            onPatch={patchFields}
            onRemove={(slug) => removeItem.mutate(slug)}
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
                Filtre o catálogo e escolha um item para a mochila.
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-hidden">
              <ItemPicker
                id="inventory-item"
                value={selectedSlug}
                onChange={setSelectedSlug}
                disabled={addItem.isPending}
              />
            </div>

            <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                <FieldLabel htmlFor="item-qty" className="shrink-0">
                  Quantidade
                </FieldLabel>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    aria-label="Diminuir quantidade"
                    disabled={addItem.isPending || addQuantity <= 1}
                    onClick={() => setAddQuantity(addQuantity - 1)}
                  >
                    −
                  </Button>
                  <Input
                    id="item-qty"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    aria-label="Quantidade a adicionar"
                    className="h-8 w-14 px-1 text-center font-mono tabular-nums"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    onBlur={() => setAddQuantity(addQuantity)}
                    disabled={addItem.isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    aria-label="Aumentar quantidade"
                    disabled={addItem.isPending}
                    onClick={() => setAddQuantity(addQuantity + 1)}
                  >
                    +
                  </Button>
                </div>
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

function InventoryLocationSection({
  id,
  title,
  items,
  emptyMessage,
  isPending,
  onToggleLocation,
  onPatch,
  onRemove,
}: {
  id: string;
  title: string;
  items: InventoryItem[];
  emptyMessage: string;
  isPending: boolean;
  onToggleLocation: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
}) {
  return (
    <section className="space-y-1.5" aria-labelledby={`inv-${id}`}>
      <div className="flex items-center gap-2">
        <h4
          id={`inv-${id}`}
          className="text-[0.7rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
        >
          {title}
          <span className="ml-1.5 font-mono tabular-nums text-muted-foreground/80">
            ({items.length})
          </span>
        </h4>
        <span className="h-px flex-1 bg-border/50" aria-hidden />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/70 bg-background/40">
          {items.map((item) => (
            <InventoryItemRow
              key={`${item.itemSlug}-${item.equipmentSlot ?? "none"}`}
              item={item}
              isPending={isPending}
              onToggleLocation={onToggleLocation}
              onPatch={onPatch}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function InventoryItemRow({
  item,
  isPending,
  onToggleLocation,
  onPatch,
  onRemove,
}: {
  item: InventoryItem;
  isPending: boolean;
  onToggleLocation: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
}) {
  const [qtyDraft, setQtyDraft] = useState(String(item.quantity));
  const qtyId = `qty-${item.itemSlug}`;
  const slotId = `slot-${item.itemSlug}`;
  const equipped = item.location === "equipped";

  function commitQuantity() {
    const next = Math.max(1, Math.trunc(Number(qtyDraft)) || 1);
    setQtyDraft(String(next));
    if (next !== item.quantity) {
      onPatch(item.itemSlug, { quantity: next });
    }
  }

  return (
    <li className="grid gap-2 px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.itemName}</p>
        {equipped && item.equipmentSlot ? (
          <p className="text-xs text-muted-foreground">
            {SLOT_LABELS[item.equipmentSlot] ?? item.equipmentSlot}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        <Input
          id={qtyId}
          type="number"
          min={1}
          aria-label={`Quantidade de ${item.itemName}`}
          className="h-7 w-14 px-1.5 text-center font-mono text-xs tabular-nums"
          value={qtyDraft}
          disabled={isPending}
          onChange={(e) => setQtyDraft(e.target.value)}
          onBlur={commitQuantity}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitQuantity();
            }
          }}
        />

        {equipped ? (
          <select
            id={slotId}
            aria-label={`Slot de ${item.itemName}`}
            className={cn(nativeSelectClassName, "h-7 min-w-[8.5rem] py-0 text-xs")}
            value={item.equipmentSlot ?? ""}
            disabled={isPending}
            onChange={(e) => {
              const value = e.target.value as EquipmentSlot;
              if (!value) return;
              onPatch(item.itemSlug, { equipmentSlot: value });
            }}
          >
            {!item.equipmentSlot ? (
              <option value="" disabled>
                Slot
              </option>
            ) : null}
            {SLOT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={isPending}
          onClick={() => onToggleLocation(item)}
        >
          {equipped ? "Desequipar" : "Equipar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-destructive"
          disabled={isPending}
          onClick={() => onRemove(item.itemSlug)}
        >
          Remover
        </Button>
      </div>
    </li>
  );
}
