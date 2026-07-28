"use client";

import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  LinkIcon,
  LinkSlashIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import type { EquipmentWarning } from "@/entities/character/types";
import {
  ItemTypeIcon,
  MAX_ATTUNED_ITEMS,
  SLOT_LABELS,
  SLOT_OPTIONS,
  itemTypeLabel,
  type EquipmentSlot,
} from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import { QuantityStepper } from "@/features/character/character-sheet/ui/beyond/inventory/quantity-stepper";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { nativeSelectClassName } from "@/shared/ui/native-select";

type InventoryItemRowProps = {
  item: InventoryItem;
  isPending: boolean;
  attunementSlotsFull: boolean;
  warnings: EquipmentWarning[];
  onToggleLocation: (item: InventoryItem) => void;
  onToggleAttunement: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
};

export function InventoryItemRow({
  item,
  isPending,
  attunementSlotsFull,
  warnings,
  onToggleLocation,
  onToggleAttunement,
  onPatch,
  onRemove,
}: InventoryItemRowProps) {
  const [qtyDraft, setQtyDraft] = useState<string | null>(null);
  const qtyDisplay = qtyDraft ?? String(item.quantity);
  const qtyId = `qty-${item.itemSlug}`;
  const slotId = `slot-${item.itemSlug}`;
  const equipped = item.location === "equipped";
  const canAttune =
    item.requiresAttunement && (item.attuned || !attunementSlotsFull);

  function commitQuantity(nextRaw: number) {
    const next = Math.max(1, Math.trunc(nextRaw) || 1);
    setQtyDraft(null);
    if (next !== item.quantity) {
      onPatch(item.itemSlug, { quantity: next });
    }
  }

  const typeLabel = itemTypeLabel(item.itemType);
  const slotLabel =
    equipped && item.equipmentSlot
      ? (SLOT_LABELS[item.equipmentSlot] ?? item.equipmentSlot)
      : null;
  const metaParts = [
    typeLabel,
    slotLabel && slotLabel !== typeLabel ? slotLabel : null,
    item.attuned
      ? "Sintonizado"
      : item.requiresAttunement
        ? "Exige sintonia"
        : null,
  ].filter(Boolean);
  const meta = metaParts.join(" · ");

  return (
    <li className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border",
            equipped
              ? "border-secondary/40 bg-secondary/10 text-secondary"
              : "border-border/80 bg-muted/40 text-muted-foreground",
          )}
          aria-hidden
        >
          <ItemTypeIcon item={item} className="size-4" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-heading text-sm font-semibold tracking-tight">
            {item.itemName}
          </p>
          <p className="text-xs text-muted-foreground">{meta}</p>
          {warnings.length > 0 ? (
            <ul className="space-y-0.5 pt-1">
              {warnings.map((warning) => (
                <li
                  key={`${warning.code}-${warning.message}`}
                  className="inline-flex max-w-full items-start gap-1 rounded border border-secondary/30 bg-secondary/10 px-1.5 py-0.5 text-[0.65rem] leading-snug text-secondary"
                >
                  <ShieldExclamationIcon
                    className="mt-0.5 size-3 shrink-0"
                    aria-hidden
                  />
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            Qtd
          </span>
          <QuantityStepper
            id={qtyId}
            value={qtyDisplay}
            onChange={setQtyDraft}
            onCommit={commitQuantity}
            disabled={isPending}
            ariaLabel={`Quantidade de ${item.itemName}`}
          />
        </div>

        {equipped ? (
          <label className="flex items-center gap-1.5">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Slot
            </span>
            <select
              id={slotId}
              aria-label={`Slot de ${item.itemName}`}
              className={cn(
                nativeSelectClassName,
                "h-7 w-auto min-w-[9rem] py-0 text-xs",
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
                  Escolher…
                </option>
              ) : null}
              {SLOT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-1">
          {item.requiresAttunement ? (
            <Button
              type="button"
              variant={item.attuned ? "secondary" : "outline"}
              size="xs"
              className="gap-1"
              disabled={isPending || !canAttune}
              title={
                !canAttune && !item.attuned
                  ? `Limite de ${MAX_ATTUNED_ITEMS} sintonias atingido`
                  : item.attuned
                    ? "Dessintonizar"
                    : "Sintonizar"
              }
              onClick={() => onToggleAttunement(item)}
            >
              {item.attuned ? (
                <LinkSlashIcon className="size-3.5" aria-hidden />
              ) : (
                <LinkIcon className="size-3.5" aria-hidden />
              )}
              {item.attuned ? "Dessintonizar" : "Sintonizar"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={equipped ? "outline" : "secondary"}
            size="xs"
            className="gap-1"
            disabled={isPending}
            onClick={() => onToggleLocation(item)}
          >
            {equipped ? (
              <ArrowDownTrayIcon className="size-3.5" aria-hidden />
            ) : (
              <ArrowUpTrayIcon className="size-3.5" aria-hidden />
            )}
            {equipped ? "Desequipar" : "Equipar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isPending}
            aria-label={`Remover ${item.itemName}`}
            title="Remover"
            onClick={() => onRemove(item.itemSlug)}
          >
            <TrashIcon className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    </li>
  );
}
