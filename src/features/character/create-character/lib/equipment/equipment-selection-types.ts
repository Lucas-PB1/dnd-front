import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import type { EquipmentToolPool } from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";

/** Pacote virtual: ouro do antecedente em vez dos itens (PHB). */
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
  /** sortOrder da linha no pacote (para picks). */
  sortOrder?: number;
  itemSlug?: string;
  quantity?: number;
  pool?: EquipmentToolPool;
  /** Texto original do seed (debug / fallback). */
  choiceText?: string;
};

export type EquipmentResolveContext = {
  backgroundToolItemSlug?: string;
  /** Picks explícitos: chave de `choicePickKey`. */
  choicePicks?: Record<string, string>;
};
