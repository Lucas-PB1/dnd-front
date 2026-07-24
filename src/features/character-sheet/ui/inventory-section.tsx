"use client";

import { useState } from "react";

import type { PatchInventoryItemPayload } from "@/entities/character/session-types";
import {
  useAddInventoryItem,
  useCharacterInventory,
  usePatchInventoryItem,
  useRemoveInventoryItem,
} from "@/features/character-sheet/api/use-character-inventory";
import { ItemPicker } from "@/features/item-catalog/ui/item-picker";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

const LOCATION_LABELS = {
  equipped: "Equipado",
  backpack: "Mochila",
} as const;

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

type InventoryItemRow = {
  itemSlug: string;
  itemName: string;
  quantity: number;
  location: "equipped" | "backpack";
  equipmentSlot: string | null;
};

type InventorySectionProps = {
  characterId: string;
  /** Só lista itens equipados (aba Ações) — sem formulário de adicionar. */
  equippedOnly?: boolean;
};

export function InventorySection({
  characterId,
  equippedOnly = false,
}: InventorySectionProps) {
  const inventory = useCharacterInventory(characterId);
  const addItem = useAddInventoryItem(characterId);
  const patchItem = usePatchInventoryItem(characterId);
  const removeItem = useRemoveInventoryItem(characterId);

  const [selectedSlug, setSelectedSlug] = useState("");
  const [newQty, setNewQty] = useState("1");

  const items = inventory.data?.items ?? [];
  const equipped = items.filter((i) => i.location === "equipped");
  const backpack = items.filter((i) => i.location === "backpack");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlug.trim()) return;
    await addItem.mutateAsync({
      itemSlug: selectedSlug.trim(),
      quantity: Number(newQty) || 1,
    });
    setSelectedSlug("");
    setNewQty("1");
  }

  function patchItemFields(
    slug: string,
    payload: PatchInventoryItemPayload,
  ) {
    patchItem.mutate({ itemSlug: slug, payload });
  }

  if (inventory.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando inventário…</p>
    );
  }

  const groupProps = {
    onToggleLocation: (slug: string, current: "equipped" | "backpack") =>
      patchItemFields(slug, {
        location: current === "equipped" ? "backpack" : "equipped",
      }),
    onPatch: patchItemFields,
    onRemove: (slug: string) => removeItem.mutate(slug),
    isPending: patchItem.isPending || removeItem.isPending,
    allowEdit: !equippedOnly,
  };

  if (equippedOnly) {
    return (
      <div className="space-y-3">
        <InventoryGroup
          title="Em mãos / corpo"
          items={equipped}
          {...groupProps}
          allowEdit={false}
        />
        {equipped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nada equipado. Use a aba Inventário para vestir itens.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Itens adquiridos em jogo — separado do equipamento inicial da criação.
      </p>

      <form onSubmit={handleAdd} className="flex flex-col gap-4">
        <ItemPicker
          id="inventory-item"
          value={selectedSlug}
          onChange={setSelectedSlug}
          disabled={addItem.isPending}
        />
        <div className="flex flex-wrap items-end gap-3">
          <Field className="w-24">
            <FieldLabel htmlFor="item-qty">Qtd</FieldLabel>
            <Input
              id="item-qty"
              type="number"
              min={1}
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
            />
          </Field>
          <Button
            type="submit"
            disabled={addItem.isPending || !selectedSlug.trim()}
          >
            {addItem.isPending ? "Adicionando…" : "Adicionar"}
          </Button>
        </div>
      </form>

      <InventoryGroup title="Equipado" items={equipped} {...groupProps} />
      <InventoryGroup title="Mochila" items={backpack} {...groupProps} />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Inventário vazio.</p>
      ) : null}

      {(addItem.error ?? patchItem.error ?? removeItem.error) ? (
        <p className="text-sm text-destructive" role="alert">
          {(addItem.error ?? patchItem.error ?? removeItem.error) instanceof
          Error
            ? (addItem.error ?? patchItem.error ?? removeItem.error)?.message
            : "Erro no inventário"}
        </p>
      ) : null}
    </div>
  );
}

function InventoryGroup({
  title,
  items,
  onToggleLocation,
  onPatch,
  onRemove,
  isPending,
  allowEdit,
}: {
  title: string;
  items: InventoryItemRow[];
  onToggleLocation: (slug: string, location: "equipped" | "backpack") => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
  isPending: boolean;
  allowEdit: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <InventoryItemCard
            key={`${item.itemSlug}-${item.quantity}-${item.equipmentSlot ?? "none"}`}
            item={item}
            allowEdit={allowEdit}
            isPending={isPending}
            onToggleLocation={onToggleLocation}
            onPatch={onPatch}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </div>
  );
}

function InventoryItemCard({
  item,
  allowEdit,
  isPending,
  onToggleLocation,
  onPatch,
  onRemove,
}: {
  item: InventoryItemRow;
  allowEdit: boolean;
  isPending: boolean;
  onToggleLocation: (slug: string, location: "equipped" | "backpack") => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
}) {
  const [qtyDraft, setQtyDraft] = useState(String(item.quantity));
  const qtyId = `qty-${item.itemSlug}`;
  const slotId = `slot-${item.itemSlug}`;

  function commitQuantity() {
    const next = Math.max(1, Math.trunc(Number(qtyDraft)) || 1);
    setQtyDraft(String(next));
    if (next !== item.quantity) {
      onPatch(item.itemSlug, { quantity: next });
    }
  }

  return (
    <li className="space-y-2 rounded-lg border border-border px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-medium">{item.itemName}</span>
          {!allowEdit ? (
            <>
              <span className="ml-2 text-muted-foreground">
                × {item.quantity}
              </span>
              {item.equipmentSlot ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({SLOT_LABELS[item.equipmentSlot] ?? item.equipmentSlot})
                </span>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isPending}
            onClick={() => onToggleLocation(item.itemSlug, item.location)}
          >
            Mover para{" "}
            {item.location === "equipped"
              ? LOCATION_LABELS.backpack
              : LOCATION_LABELS.equipped}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={cn("text-destructive")}
            disabled={isPending}
            onClick={() => onRemove(item.itemSlug)}
          >
            Remover
          </Button>
        </div>
      </div>

      {allowEdit ? (
        <div className="flex flex-wrap items-end gap-3 border-t border-border/50 pt-2">
          <Field className="w-20">
            <FieldLabel htmlFor={qtyId}>Qtd</FieldLabel>
            <Input
              id={qtyId}
              type="number"
              min={1}
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
          </Field>
          {item.location === "equipped" ? (
            <Field className="min-w-[10rem] flex-1">
              <FieldLabel htmlFor={slotId}>Slot</FieldLabel>
              <select
                id={slotId}
                className={cn(
                  "border-input bg-background h-8 w-full rounded-md border px-2 text-sm",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
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
                    Escolher slot
                  </option>
                ) : null}
                {SLOT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
