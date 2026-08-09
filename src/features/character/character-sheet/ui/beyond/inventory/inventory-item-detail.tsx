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
  MAX_ATTUNED_ITEMS,
  SLOT_LABELS,
  SLOT_OPTIONS,
  effectsStatusLabel,
  itemTypeLabel,
  type EquipmentSlot,
} from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import { QuantityStepper } from "@/features/character/character-sheet/ui/beyond/inventory/quantity-stepper";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type InventoryItemDetailProps = {
  item: InventoryItem;
  isPending: boolean;
  attunementSlotsFull: boolean;
  warnings: EquipmentWarning[];
  weaponOptions?: { value: string; label: string }[];
  canBindPactWeapon?: boolean;
  onToggleLocation: (item: InventoryItem) => void;
  onToggleAttunement: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
  onAttachCharm?: (weaponSlug: string, charmSlug: string) => void;
  onDetachCharm?: (weaponSlug: string) => void;
};

function isWeaponCharmSlug(slug: string): boolean {
  return slug.startsWith("weapon-charm-");
}

/** Controles e avisos do item (usado no modal do tile). */
export function InventoryItemDetail({
  item,
  isPending,
  attunementSlotsFull,
  warnings,
  weaponOptions = [],
  canBindPactWeapon = false,
  onToggleLocation,
  onToggleAttunement,
  onPatch,
  onRemove,
  onAttachCharm,
  onDetachCharm,
}: InventoryItemDetailProps) {
  const [qtyDraft, setQtyDraft] = useState<string | null>(null);
  const [attachWeaponSlug, setAttachWeaponSlug] = useState("");
  const qtyDisplay = qtyDraft ?? String(item.quantity);
  const qtyId = `qty-${item.itemSlug}`;
  const slotId = `slot-${item.itemSlug}`;
  const equipped = item.location === "equipped";
  const canAttune =
    item.requiresAttunement && (item.attuned || !attunementSlotsFull);
  const showAttach =
    isWeaponCharmSlug(item.itemSlug) &&
    item.location === "backpack" &&
    Boolean(onAttachCharm) &&
    weaponOptions.length > 0;
  const showDetach =
    Boolean(item.attachedCharmSlug) && Boolean(onDetachCharm);
  const showPactWeapon =
    canBindPactWeapon && item.itemType === "weapon";
  const isPactWeapon = Boolean(item.isPactWeapon);

  function commitQuantity(nextRaw: number) {
    const next = Math.max(1, Math.trunc(nextRaw) || 1);
    setQtyDraft(null);
    if (next !== item.quantity) {
      onPatch(item.itemSlug, { quantity: next });
    }
  }

  const effectsLabel =
    item.requiresAttunement || item.itemType === "other"
      ? effectsStatusLabel(item.effectsStatus)
      : null;

  return (
    <div className="space-y-4">
      {effectsLabel ? (
        <p
          className={cn(
            "text-sm font-medium",
            item.effectsActive ? "text-secondary" : "text-muted-foreground",
          )}
        >
          Efeitos: {effectsLabel}
        </p>
      ) : null}

      {item.attachedCharmName ? (
        <p className="text-xs text-muted-foreground">
          Encanto: {item.attachedCharmName}
        </p>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="space-y-1">
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

      <div className="flex flex-wrap items-center gap-3">
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
            <SearchableSelect
              id={slotId}
              aria-label={`Slot de ${item.itemName}`}
              className="h-7 w-auto min-w-[9rem] text-xs"
              value={item.equipmentSlot ?? ""}
              disabled={isPending}
              placeholder="Escolher…"
              options={[
                ...(!item.equipmentSlot
                  ? [{ value: "", label: "Escolher…" }]
                  : []),
                ...SLOT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
              onValueChange={(next) => {
                if (!next) return;
                onPatch(item.itemSlug, {
                  equipmentSlot: next as EquipmentSlot,
                });
              }}
            />
          </label>
        ) : null}
      </div>

      {showAttach ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Prender em
            </span>
            <SearchableSelect
              id={`attach-${item.itemSlug}`}
              aria-label={`Arma para ${item.itemName}`}
              className="h-7 text-xs"
              value={attachWeaponSlug}
              disabled={isPending}
              placeholder="Escolher arma…"
              options={weaponOptions}
              onValueChange={setAttachWeaponSlug}
            />
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending || !attachWeaponSlug}
            onClick={() => {
              if (!attachWeaponSlug || !onAttachCharm) return;
              onAttachCharm(attachWeaponSlug, item.itemSlug);
            }}
          >
            Prender
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {item.requiresAttunement ? (
          <Button
            type="button"
            variant={item.attuned ? "secondary" : "outline"}
            size="sm"
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
        {showPactWeapon ? (
          <Button
            type="button"
            variant={isPactWeapon ? "secondary" : "outline"}
            size="sm"
            className="gap-1"
            disabled={isPending}
            title={
              isPactWeapon
                ? "Remover vínculo de Arma de Pacto"
                : "Marcar como Arma de Pacto"
            }
            onClick={() =>
              onPatch(item.itemSlug, { pactWeapon: !isPactWeapon })
            }
          >
            {isPactWeapon ? "Remover vínculo" : "Arma de Pacto"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={equipped ? "outline" : "secondary"}
          size="sm"
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
        {showDetach ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onDetachCharm?.(item.itemSlug)}
          >
            Remover encanto
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending}
          onClick={() => onRemove(item.itemSlug)}
        >
          <TrashIcon className="size-3.5" aria-hidden />
          Remover
        </Button>
      </div>
    </div>
  );
}

export function inventoryItemTileMeta(item: InventoryItem): {
  subtitle: string;
  badge: string;
  accent: boolean;
} {
  const typeLabel = itemTypeLabel(item.itemType);
  const equipped = item.location === "equipped";
  const slotLabel =
    equipped && item.equipmentSlot
      ? (SLOT_LABELS[item.equipmentSlot] ?? item.equipmentSlot)
      : null;
  const parts = [
    item.quantity > 1 ? `×${item.quantity}` : null,
    item.isPactWeapon ? "Arma de Pacto" : null,
    item.attuned
      ? "Sintonizado"
      : item.requiresAttunement
        ? "Exige sintonia"
        : null,
    item.attachedCharmName ? `Encanto: ${item.attachedCharmName}` : null,
  ].filter(Boolean);

  return {
    badge: item.isPactWeapon
      ? "Pacto"
      : (slotLabel ?? typeLabel),
    subtitle: parts.length > 0 ? parts.join(" · ") : typeLabel,
    accent:
      equipped ||
      item.attuned ||
      Boolean(item.isPactWeapon) ||
      Boolean(item.attachedCharmSlug),
  };
}
