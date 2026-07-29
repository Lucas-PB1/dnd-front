import type { ComponentType, SVGProps } from "react";
import {
  CubeIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

import type { InventoryItem } from "@/entities/character/session-types";
import { cn } from "@/shared/lib/utils";

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const MAX_ATTUNED_ITEMS = 3;

export const SLOT_OPTIONS = [
  { value: "armor", label: "Armadura" },
  { value: "shield", label: "Escudo" },
  { value: "main_hand", label: "Mão principal" },
  { value: "off_hand", label: "Mão secundária" },
  { value: "worn", label: "Vestido" },
  { value: "carried", label: "Carregado" },
] as const;

export type EquipmentSlot = (typeof SLOT_OPTIONS)[number]["value"];

export const SLOT_LABELS: Record<string, string> = Object.fromEntries(
  SLOT_OPTIONS.map((option) => [option.value, option.label]),
);

export function effectsStatusLabel(
  status: InventoryItem["effectsStatus"] | undefined,
): string | null {
  if (status === "active") return "Ativo";
  if (status === "inactive_unequipped") return "Inativo — equipe";
  if (status === "inactive_unattuned") return "Inativo — sintonize";
  return null;
}

export function itemTypeLabel(itemType: string): string {
  const known: Record<string, string> = {
    armor: "Armadura",
    weapon: "Arma",
    shield: "Escudo",
    gear: "Item",
    tool: "Ferramenta",
    other: "Item mágico",
    adventuring_gear: "Equipamento",
    unknown: "Item",
  };
  return known[itemType] ?? itemType;
}

export function ItemTypeIcon({
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
