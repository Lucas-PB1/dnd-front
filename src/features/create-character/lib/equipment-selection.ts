export {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  type EquipmentLine,
  type EquipmentLineKind,
  type EquipmentPackage,
  type EquipmentResolveContext,
} from "@/features/create-character/lib/equipment-selection-types";

export {
  automaticPackageItemSlugs,
  formatClassEquipmentLine,
  groupEquipmentPackages,
  isGoldOnlyClassPackage,
} from "@/features/create-character/lib/equipment-package-grouping";

export {
  backgroundEquipmentLines,
  classEquipmentLines,
  pendingEquipmentChoices,
} from "@/features/create-character/lib/equipment-line-resolve";

export {
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
} from "@/features/create-character/lib/equipment-payload";
