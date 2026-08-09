export {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  type EquipmentLine,
  type EquipmentLineKind,
  type EquipmentPackage,
  type EquipmentResolveContext,
} from "./equipment-selection-types";

export {
  automaticPackageItemSlugs,
  formatClassEquipmentLine,
  groupEquipmentPackages,
  isGoldOnlyClassPackage,
} from "./equipment-package-grouping";

export {
  backgroundEquipmentLines,
  classEquipmentLines,
  pendingEquipmentChoices,
} from "./equipment-line-resolve";

export {
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
} from "./equipment-payload";
