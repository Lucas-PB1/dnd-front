export {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  type EquipmentLine,
  type EquipmentLineKind,
  type EquipmentPackage,
  type EquipmentResolveContext,
} from "@/features/create-character/lib/equipment/equipment-selection-types";

export {
  automaticPackageItemSlugs,
  formatClassEquipmentLine,
  groupEquipmentPackages,
  isGoldOnlyClassPackage,
} from "@/features/create-character/lib/equipment/equipment-package-grouping";

export {
  backgroundEquipmentLines,
  classEquipmentLines,
  pendingEquipmentChoices,
} from "@/features/create-character/lib/equipment/equipment-line-resolve";

export {
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
} from "@/features/create-character/lib/equipment/equipment-payload";
