import type { CharacterEquipment } from "@/entities/character/sheet-types";
import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import { automaticPackageItemSlugs } from "@/features/create-character/lib/equipment/equipment-package-grouping";
import {
  backgroundEquipmentLines,
  classEquipmentLines,
} from "@/features/create-character/lib/equipment/equipment-line-resolve";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  type EquipmentLine,
  type EquipmentPackage,
  type EquipmentResolveContext,
} from "@/features/create-character/lib/equipment/equipment-selection-types";

function appendResolvedItems(
  items: CharacterEquipment[],
  source: "class" | "background",
  packageSlug: string,
  lines: EquipmentLine[],
) {
  let sortOrder = items.length;
  for (const line of lines) {
    if (line.kind !== "item" || !line.itemSlug) continue;
    // Evita duplicar itemSlug já vindo de row.itemSlug
    if (
      items.some(
        (e) => e.itemSlug === line.itemSlug && e.packageSlug === packageSlug,
      )
    ) {
      continue;
    }
    items.push({
      source,
      packageSlug,
      itemSlug: line.itemSlug,
      quantity: line.quantity ?? 1,
      sortOrder: sortOrder++,
    });
  }
}

export function buildClassEquipmentPayload(
  packageSlug: string,
  rows: ClassEquipmentOption[],
  ctx: EquipmentResolveContext = {},
): CharacterEquipment[] {
  const pkg: EquipmentPackage<ClassEquipmentOption> = {
    packageSlug,
    packageLabel: packageSlug,
    rows,
  };
  const lines = classEquipmentLines(pkg, ctx);
  const items: CharacterEquipment[] = [
    { source: "class", packageSlug, sortOrder: 0 },
  ];

  // Itens já ligados no seed
  automaticPackageItemSlugs(rows).forEach((itemSlug, index) => {
    const row = rows.find((r) => r.itemSlug === itemSlug);
    items.push({
      source: "class",
      packageSlug,
      itemSlug,
      quantity: row?.quantity ?? 1,
      sortOrder: index + 1,
    });
  });

  appendResolvedItems(items, "class", packageSlug, lines);
  return items;
}

export function buildBackgroundEquipmentPayload(
  packageSlug: string,
  rows: BackgroundEquipmentOption[],
  ctx: EquipmentResolveContext = {},
): CharacterEquipment[] {
  if (packageSlug === BACKGROUND_GOLD_PACKAGE_SLUG) {
    return [{ source: "background", packageSlug, sortOrder: 0 }];
  }

  const pkg: EquipmentPackage<BackgroundEquipmentOption> = {
    packageSlug,
    packageLabel: packageSlug,
    rows,
  };
  const lines = backgroundEquipmentLines(pkg, ctx);
  const items: CharacterEquipment[] = [
    { source: "background", packageSlug, sortOrder: 0 },
  ];

  automaticPackageItemSlugs(rows).forEach((itemSlug, index) => {
    const row = rows.find((r) => r.itemSlug === itemSlug);
    items.push({
      source: "background",
      packageSlug,
      itemSlug,
      quantity: row?.quantity ?? 1,
      sortOrder: index + 1,
    });
  });

  appendResolvedItems(items, "background", packageSlug, lines);
  return items;
}
