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
  weaponOptions?: { value: string; label: string }[];
  canBindPactWeapon?: boolean;
  onToggleLocation: (item: InventoryItem) => void;
  onToggleAttunement: (item: InventoryItem) => void;
  onPatch: (slug: string, payload: PatchInventoryItemPayload) => void;
  onRemove: (slug: string) => void;
  onAttachCharm?: (weaponSlug: string, charmSlug: string) => void;
  onDetachCharm?: (weaponSlug: string) => void;
  baseOptions?: {
    value: string;
    label: string;
    itemType?: string;
    equipmentSlot?: string | null;
  }[];
  containerOptions?: { value: string; label: string }[];
  onAttachCoverage?: (
    baseItemSlug: string,
    coverageSlug: string,
    bonus?: 1 | 2 | 3,
    spellSlug?: string,
  ) => void;
  onDetachCoverage?: (baseItemSlug: string) => void;
  sellCreditApplies?: boolean;
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
  weaponOptions = [],
  baseOptions = [],
  containerOptions = [],
  canBindPactWeapon = false,
  onToggleLocation,
  onToggleAttunement,
  onPatch,
  onRemove,
  onAttachCharm,
  onDetachCharm,
  onAttachCoverage,
  onDetachCoverage,
  sellCreditApplies = false,
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
            weaponOptions={weaponOptions}
            baseOptions={baseOptions}
            containerOptions={containerOptions}
            canBindPactWeapon={canBindPactWeapon}
            onToggleLocation={onToggleLocation}
            onToggleAttunement={onToggleAttunement}
            onPatch={onPatch}
            onRemove={onRemove}
            onAttachCharm={onAttachCharm}
            onDetachCharm={onDetachCharm}
            onAttachCoverage={onAttachCoverage}
            onDetachCoverage={onDetachCoverage}
            sellCreditApplies={sellCreditApplies}
          />
        ),
      };
    });
  }, [
    attunementSlotsFull,
    baseOptions,
    containerOptions,
    canBindPactWeapon,
    equipmentWarnings,
    isPending,
    items,
    onAttachCharm,
    onAttachCoverage,
    onDetachCharm,
    onDetachCoverage,
    onPatch,
    onRemove,
    onToggleAttunement,
    onToggleLocation,
    sellCreditApplies,
    weaponOptions,
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
