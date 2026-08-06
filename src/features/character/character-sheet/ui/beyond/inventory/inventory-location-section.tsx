"use client";

import { useMemo } from "react";

import type {
  InventoryItem,
  PatchInventoryItemPayload,
} from "@/entities/character/session-types";
import type { EquipmentWarning } from "@/entities/character/types";
import type { HeroIcon } from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-meta";
import {
  InventoryItemDetail,
  inventoryItemTileMeta,
} from "@/features/character/character-sheet/ui/beyond/inventory/inventory-item-detail";
import {
  DetailTileGrid,
  type DetailTileItem,
} from "@/features/character/character-sheet/ui/sections/detail-tile-grid";
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
  const tiles = useMemo((): DetailTileItem[] => {
    return items.map((item) => {
      const meta = inventoryItemTileMeta(item);
      const warnings = equipmentWarnings.filter(
        (warning) => warning.itemSlug === item.itemSlug,
      );
      return {
        id: `${item.itemSlug}-${item.equipmentSlot ?? "none"}`,
        title: item.itemName,
        subtitle: meta.subtitle,
        badge: meta.badge,
        accent: meta.accent,
        body: (
          <InventoryItemDetail
            item={item}
            isPending={isPending}
            attunementSlotsFull={attunementSlotsFull}
            warnings={warnings}
            onToggleLocation={onToggleLocation}
            onToggleAttunement={onToggleAttunement}
            onPatch={onPatch}
            onRemove={onRemove}
          />
        ),
      };
    });
  }, [
    attunementSlotsFull,
    equipmentWarnings,
    isPending,
    items,
    onPatch,
    onRemove,
    onToggleAttunement,
    onToggleLocation,
  ]);

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
        <DetailTileGrid
          items={tiles}
          hint="Toque em um item para gerenciar."
        />
      )}
    </section>
  );
}
