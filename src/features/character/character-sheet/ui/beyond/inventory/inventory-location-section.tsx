"use client";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import type { EquipmentWarning } from "@/entities/character/types";
import type { HeroIcon } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import { InventoryItemRow } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-row";
import {
  SheetEmptyHint,
  SheetSubheader,
} from "@/features/character/character-sheet/ui/sheet/sheet-ui";

type InventoryLocationSectionProps = {
  id: string;
  title: string;
  icon: HeroIcon;
  items: InventoryItem[];
  emptyMessage: string;
  isPending: boolean;
  attunementSlotsFull: boolean;
  equipmentWarnings: EquipmentWarning[];
  onToggleLocation: (item: InventoryItem) => void;
  onToggleAttunement: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
};

export function InventoryLocationSection({
  id,
  title,
  icon: Icon,
  items,
  emptyMessage,
  isPending,
  attunementSlotsFull,
  equipmentWarnings,
  onToggleLocation,
  onToggleAttunement,
  onPatch,
  onRemove,
}: InventoryLocationSectionProps) {
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
              attunementSlotsFull={attunementSlotsFull}
              warnings={equipmentWarnings.filter(
                (warning) => warning.itemSlug === item.itemSlug,
              )}
              onToggleLocation={onToggleLocation}
              onToggleAttunement={onToggleAttunement}
              onPatch={onPatch}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
