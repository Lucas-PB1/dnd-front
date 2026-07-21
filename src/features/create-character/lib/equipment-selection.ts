import type { CharacterEquipment } from "@/entities/character/sheet-types";
import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";

/** Pacote virtual: ouro do antecedente em vez dos itens (PHB). */
export const BACKGROUND_GOLD_PACKAGE_SLUG = "gold";

export type EquipmentPackage<
  T extends ClassEquipmentOption | BackgroundEquipmentOption,
> = {
  packageSlug: string;
  packageLabel: string;
  rows: T[];
};

export function groupEquipmentPackages<
  T extends ClassEquipmentOption | BackgroundEquipmentOption,
>(rows: T[]): EquipmentPackage<T>[] {
  const map = new Map<string, EquipmentPackage<T>>();

  for (const row of rows) {
    const existing = map.get(row.packageSlug);
    if (existing) {
      existing.rows.push(row);
    } else {
      map.set(row.packageSlug, {
        packageSlug: row.packageSlug,
        packageLabel: row.packageLabel,
        rows: [row],
      });
    }
  }

  return [...map.values()].sort((a, b) =>
    a.packageSlug.localeCompare(b.packageSlug),
  );
}

export function formatClassEquipmentLine(row: ClassEquipmentOption): string {
  if (row.itemName) {
    const qty =
      row.quantity != null && row.quantity > 1 ? `${row.quantity}× ` : "";
    return `${qty}${row.itemName}`;
  }
  if (row.choiceText) return row.choiceText;
  if (row.goldAmount != null) return `${row.goldAmount} PO`;
  return "—";
}

export function formatBackgroundEquipmentLine(
  row: BackgroundEquipmentOption,
): string {
  if (row.itemName) {
    const qty =
      row.quantity != null && row.quantity > 1 ? `${row.quantity}× ` : "";
    return `${qty}${row.itemName}`;
  }
  if (row.choiceText) return row.choiceText;
  return "—";
}

export function automaticPackageItemSlugs<
  T extends ClassEquipmentOption | BackgroundEquipmentOption,
>(rows: T[]): string[] {
  return rows
    .filter((row) => row.itemSlug)
    .map((row) => row.itemSlug!)
    .filter((slug, index, all) => all.indexOf(slug) === index);
}

export function buildClassEquipmentPayload(
  packageSlug: string,
  rows: ClassEquipmentOption[],
  selectedItemSlugs?: string[],
): CharacterEquipment[] {
  const slugs = selectedItemSlugs ?? automaticPackageItemSlugs(rows);
  const items: CharacterEquipment[] = [
    { source: "class", packageSlug, sortOrder: 0 },
  ];

  slugs.forEach((itemSlug, index) => {
    const row = rows.find((r) => r.itemSlug === itemSlug);
    items.push({
      source: "class",
      packageSlug,
      itemSlug,
      quantity: row?.quantity ?? 1,
      sortOrder: index + 1,
    });
  });

  return items;
}

export function buildBackgroundEquipmentPayload(
  packageSlug: string,
  rows: BackgroundEquipmentOption[],
  selectedItemSlugs?: string[],
): CharacterEquipment[] {
  if (packageSlug === BACKGROUND_GOLD_PACKAGE_SLUG) {
    return [{ source: "background", packageSlug, sortOrder: 0 }];
  }

  const slugs = selectedItemSlugs ?? automaticPackageItemSlugs(rows);
  const items: CharacterEquipment[] = [
    { source: "background", packageSlug, sortOrder: 0 },
  ];

  slugs.forEach((itemSlug, index) => {
    const row = rows.find((r) => r.itemSlug === itemSlug);
    items.push({
      source: "background",
      packageSlug,
      itemSlug,
      quantity: row?.quantity ?? 1,
      sortOrder: index + 1,
    });
  });

  return items;
}

/** @deprecated Use automaticPackageItemSlugs */
export function getPackageItemChoices<
  T extends ClassEquipmentOption | BackgroundEquipmentOption,
>(pkg: EquipmentPackage<T>): T[] {
  return pkg.rows.filter((row) => row.itemSlug);
}
