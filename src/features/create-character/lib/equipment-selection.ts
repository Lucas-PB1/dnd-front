import type { CharacterEquipment } from "@/entities/character/sheet-types";
import type { BackgroundEquipmentOption } from "@/entities/background/types";
import type { ClassEquipmentOption } from "@/entities/class/types";
import {
  choicePickKey,
  resolveEquipmentChoiceText,
  toolNameForSlug,
  type EquipmentToolPool,
  type ResolvedChoice,
} from "@/features/create-character/lib/equipment-choice-resolve";

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

/** Linhas que ainda precisam de seleção do jogador. */
export function pendingEquipmentChoices(
  lines: EquipmentLine[],
): EquipmentLine[] {
  return lines.filter(
    (line) => line.kind === "pick-tool" || line.kind === "mirror-tool",
  );
}
