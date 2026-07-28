import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import { resolveEquipmentChoiceText } from "@/features/create-character/lib/equipment/equipment-choice-resolve";
import { classEquipmentLines } from "@/features/create-character/lib/equipment/equipment-line-resolve";
import type { EquipmentPackage } from "@/features/create-character/lib/equipment/equipment-selection-types";

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
  if (row.choiceText) {
    const resolved = resolveEquipmentChoiceText(row.choiceText);
    if (resolved.kind === "fixed") return resolved.label;
    return resolved.label;
  }
  if (row.goldAmount != null) return `${row.goldAmount} PO`;
  return "—";
}

/** Pacote só com ouro (ex.: opção B do guerreiro). */
export function isGoldOnlyClassPackage(
  pkg: EquipmentPackage<ClassEquipmentOption>,
): boolean {
  const lines = classEquipmentLines(pkg);
  return lines.length > 0 && lines.every((line) => line.kind === "gold");
}

export function automaticPackageItemSlugs<
  T extends ClassEquipmentOption | BackgroundEquipmentOption,
>(rows: T[]): string[] {
  return rows
    .filter((row) => row.itemSlug)
    .map((row) => row.itemSlug!)
    .filter((slug, index, all) => all.indexOf(slug) === index);
}
