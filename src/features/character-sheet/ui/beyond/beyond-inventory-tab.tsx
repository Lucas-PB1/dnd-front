"use client";

import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CubeIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import type { EquipmentWarning } from "@/entities/character/types";
import {
  useAddInventoryItem,
  useCharacterInventory,
  usePatchInventoryItem,
  useRemoveInventoryItem,
} from "@/features/character-sheet/api/use-character-inventory";
import { ItemPicker } from "@/features/item-catalog/ui/item-picker";
import {
  SheetEmptyHint,
  SheetSubheader,
} from "@/features/character-sheet/ui/sheet-ui";
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
import { Input } from "@/shared/ui/input";
import { nativeSelectClassName } from "@/shared/ui/native-select";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

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

function itemTypeLabel(itemType: string): string {
  const known: Record<string, string> = {
    armor: "Armadura",
    weapon: "Arma",
    shield: "Escudo",
    gear: "Item",
    tool: "Ferramenta",
    adventuring_gear: "Equipamento",
    unknown: "Item",
  };
  return known[itemType] ?? itemType;
}

function ItemTypeIcon({
  item,
  className,
}: {
  item: InventoryItem;
  className?: string;
}) {
  const key = (item.equipmentSlot ?? item.itemType).toLowerCase();
  let Icon: HeroIcon = CubeIcon;
  if (key.includes("armor") || key === "armor") Icon = ShieldCheckIcon;
  else if (key.includes("shield") || key === "shield")
    Icon = ShieldExclamationIcon;
  else if (key.includes("weapon") || key.includes("hand")) Icon = CubeIcon;

  return <Icon className={cn("size-4", className)} aria-hidden />;
}

type BeyondInventoryTabProps = {
  characterId: string;
  equipmentWarnings?: EquipmentWarning[];
};

/**
 * Inventário estilo Beyond: só itens (Equipado / Mochila).
 * Pacotes de criação viram itens no inventário (API).
 */
export function BeyondInventoryTab({
  characterId,
  equipmentWarnings = [],
}: BeyondInventoryTabProps) {
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
        <h3 className="font-heading text-sm font-semibold tracking-tight">
          Inventário
        </h3>
        <div className="flex items-center gap-2">
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
            equipmentWarnings={equipmentWarnings}
            onToggleLocation={toggleLocation}
            onPatch={patchFields}
            onRemove={(slug) => removeItem.mutate(slug)}
          />
          <InventoryLocationSection
            id="backpack"
            title="Mochila"
            icon={ArchiveBoxIcon}
            items={backpack}
            emptyMessage="Mochila vazia — adicione itens do catálogo."
            isPending={isPending}
            equipmentWarnings={equipmentWarnings}
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

function InventoryLocationSection({
  id,
  title,
  icon: Icon,
  items,
  emptyMessage,
  isPending,
  equipmentWarnings,
  onToggleLocation,
  onPatch,
  onRemove,
}: {
  id: string;
  title: string;
  icon: HeroIcon;
  items: InventoryItem[];
  emptyMessage: string;
  isPending: boolean;
  equipmentWarnings: EquipmentWarning[];
  onToggleLocation: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
}) {
  return (
    <section className="space-y-2" aria-labelledby={`inv-${id}`}>
      <SheetSubheader
        id={`inv-${id}`}
        title={title}
        count={items.length}
        icon={Icon}
      />

      {items.length === 0 ? (
        <SheetEmptyHint>{emptyMessage}</SheetEmptyHint>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border/70 bg-card/40 divide-y divide-border/40">
          {items.map((item) => (
            <InventoryItemRow
              key={`${item.itemSlug}-${item.equipmentSlot ?? "none"}`}
              item={item}
              isPending={isPending}
              warnings={equipmentWarnings.filter(
                (w) => w.itemSlug === item.itemSlug,
              )}
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

function QuantityStepper({
  id,
  value,
  onChange,
  onCommit,
  disabled,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  onCommit: (next: number) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  const numeric = Math.max(1, Math.trunc(Number(value)) || 1);

  return (
    <div className="inline-flex items-center rounded-md border border-border/80 bg-background/60">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="rounded-none rounded-l-md"
        aria-label="Diminuir quantidade"
        disabled={disabled || numeric <= 1}
        onClick={() => onCommit(numeric - 1)}
      >
        <MinusIcon className="size-3.5" aria-hidden />
      </Button>
      <Input
        id={id}
        type="number"
        min={1}
        inputMode="numeric"
        aria-label={ariaLabel}
        className="h-7 w-11 rounded-none border-0 border-x border-border/80 bg-transparent px-1 text-center font-mono text-xs tabular-nums shadow-none focus-visible:ring-0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onCommit(numeric)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit(numeric);
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="rounded-none rounded-r-md"
        aria-label="Aumentar quantidade"
        disabled={disabled}
        onClick={() => onCommit(numeric + 1)}
      >
        <PlusIcon className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}

function InventoryItemRow({
  item,
  isPending,
  warnings,
  onToggleLocation,
  onPatch,
  onRemove,
}: {
  item: InventoryItem;
  isPending: boolean;
  warnings: EquipmentWarning[];
  onToggleLocation: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
}) {
  const [qtyDraft, setQtyDraft] = useState(String(item.quantity));
  const qtyId = `qty-${item.itemSlug}`;
  const slotId = `slot-${item.itemSlug}`;
  const equipped = item.location === "equipped";

  useEffect(() => {
    setQtyDraft(String(item.quantity));
  }, [item.quantity]);

  function commitQuantity(nextRaw: number) {
    const next = Math.max(1, Math.trunc(nextRaw) || 1);
    setQtyDraft(String(next));
    if (next !== item.quantity) {
      onPatch(item.itemSlug, { quantity: next });
    }
  }

  const typeLabel = itemTypeLabel(item.itemType);
  const slotLabel =
    equipped && item.equipmentSlot
      ? (SLOT_LABELS[item.equipmentSlot] ?? item.equipmentSlot)
      : null;
  const meta =
    slotLabel && slotLabel !== typeLabel
      ? `${typeLabel} · ${slotLabel}`
      : (slotLabel ?? typeLabel);

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
            value={qtyDraft}
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
