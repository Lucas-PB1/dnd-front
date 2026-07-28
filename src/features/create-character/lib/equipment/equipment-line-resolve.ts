import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import {
  choicePickKey,
  resolveEquipmentChoiceText,
  toolNameForSlug,
  type ResolvedChoice,
} from "@/features/create-character/lib/equipment/equipment-choice-resolve";
import type {
  EquipmentLine,
  EquipmentPackage,
  EquipmentResolveContext,
} from "@/features/create-character/lib/equipment/equipment-selection-types";

function lineFromResolved(
  resolved: ResolvedChoice,
  sortOrder: number,
  choiceText: string,
  ctx: EquipmentResolveContext,
  source: "class" | "background",
  packageSlug: string,
): EquipmentLine {
  if (resolved.kind === "fixed") {
    return {
      kind: "item",
      label: resolved.label,
      itemSlug: resolved.itemSlug,
      quantity: resolved.quantity,
      sortOrder,
      choiceText,
    };
  }

  if (resolved.kind === "text") {
    return { kind: "text", label: resolved.label, sortOrder, choiceText };
  }

  if (resolved.kind === "mirror-tool") {
    const mirrored = ctx.backgroundToolItemSlug?.trim();
    if (mirrored) {
      const name = toolNameForSlug(mirrored, resolved.pool) ?? mirrored;
      return {
        kind: "item",
        label: name,
        itemSlug: mirrored,
        quantity: 1,
        sortOrder,
        pool: resolved.pool,
        choiceText,
      };
    }
    return {
      kind: "mirror-tool",
      label: resolved.label,
      sortOrder,
      pool: resolved.pool,
      choiceText,
    };
  }

  const pickKey = choicePickKey(source, packageSlug, sortOrder);
  const picked = ctx.choicePicks?.[pickKey]?.trim();
  if (picked) {
    const name = toolNameForSlug(picked, resolved.pool) ?? picked;
    return {
      kind: "item",
      label: name,
      itemSlug: picked,
      quantity: 1,
      sortOrder,
      pool: resolved.pool,
      choiceText,
    };
  }

  return {
    kind: "pick-tool",
    label: resolved.label,
    sortOrder,
    pool: resolved.pool,
    choiceText,
  };
}

export function classEquipmentLines(
  pkg: EquipmentPackage<ClassEquipmentOption>,
  ctx: EquipmentResolveContext = {},
): EquipmentLine[] {
  return pkg.rows
    .map((row): EquipmentLine | null => {
      if (row.itemName) {
        const qty =
          row.quantity != null && row.quantity > 1 ? `${row.quantity}× ` : "";
        return {
          kind: "item",
          label: `${qty}${row.itemName}`,
          itemSlug: row.itemSlug ?? undefined,
          quantity: row.quantity ?? 1,
          sortOrder: row.sortOrder,
        };
      }
      if (row.choiceText) {
        return lineFromResolved(
          resolveEquipmentChoiceText(row.choiceText),
          row.sortOrder,
          row.choiceText,
          ctx,
          "class",
          pkg.packageSlug,
        );
      }
      if (row.goldAmount != null) {
        return {
          kind: "gold",
          label: `${row.goldAmount} PO`,
          sortOrder: row.sortOrder,
        };
      }
      return null;
    })
    .filter((line): line is EquipmentLine => line != null);
}

export function backgroundEquipmentLines(
  pkg: EquipmentPackage<BackgroundEquipmentOption>,
  ctx: EquipmentResolveContext = {},
): EquipmentLine[] {
  const lines = pkg.rows
    .map((row): EquipmentLine | null => {
      if (row.itemName) {
        const qty =
          row.quantity != null && row.quantity > 1 ? `${row.quantity}× ` : "";
        return {
          kind: "item",
          label: `${qty}${row.itemName}`,
          itemSlug: row.itemSlug ?? undefined,
          quantity: row.quantity ?? 1,
          sortOrder: row.sortOrder,
        };
      }
      if (row.choiceText) {
        return lineFromResolved(
          resolveEquipmentChoiceText(row.choiceText),
          row.sortOrder,
          row.choiceText,
          ctx,
          "background",
          pkg.packageSlug,
        );
      }
      return null;
    })
    .filter((line): line is EquipmentLine => line != null);

  const extraGold = pkg.rows[0]?.packageGold;
  if (extraGold != null && extraGold > 0) {
    lines.push({ kind: "gold", label: `${extraGold} PO` });
  }
  return lines;
}

/** Linhas que ainda precisam de seleção do jogador. */
export function pendingEquipmentChoices(
  lines: EquipmentLine[],
): EquipmentLine[] {
  return lines.filter(
    (line) => line.kind === "pick-tool" || line.kind === "mirror-tool",
  );
}
