import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import type {
  EquipmentToolPool,
  ToolPoolsCatalog,
} from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";

export const BACKGROUND_GOLD_PACKAGE_SLUG = "gold";

export type EquipmentPackage<
  T extends ClassEquipmentOption | BackgroundEquipmentOption,
> = {
  packageSlug: string;
  packageLabel: string;
  rows: T[];
};

export type EquipmentLineKind =
  | "item"
  | "gold"
  | "text"
  | "mirror-tool"
  | "pick-tool";

export type EquipmentLine = {
  kind: EquipmentLineKind;
  label: string;
  sortOrder?: number;
  itemSlug?: string;
  quantity?: number;
  pool?: EquipmentToolPool;
  choiceText?: string;
};

export type EquipmentResolveContext = {
  backgroundToolItemSlug?: string;
  choicePicks?: Record<string, string>;
  toolCatalog?: ToolPoolsCatalog;
};
