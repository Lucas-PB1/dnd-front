export type EquipmentToolPool = "instrument" | "gaming" | "artisan";

export type ToolCatalogOption = { slug: string; name: string };

export type ToolPoolsCatalog = Partial<
  Record<EquipmentToolPool, readonly ToolCatalogOption[]>
>;

export type ResolvedChoice =
  | {
      kind: "fixed";
      itemSlug: string;
      quantity: number;
      label: string;
    }
  | {
      kind: "text";
      label: string;
    }
  | {
      kind: "mirror-tool";
      pool: EquipmentToolPool;
      label: string;
    }
  | {
      kind: "pick-tool";
      pool: EquipmentToolPool;
      label: string;
    };

const FIXED_CHOICE_MAP: Record<
  string,
  { itemSlug: string; quantity: number; label: string }
> = {
  "2 Adagas": { itemSlug: "dagger", quantity: 2, label: "2× Adaga" },
  "4 Machadinhas": {
    itemSlug: "handaxe",
    quantity: 4,
    label: "4× Machadinha",
  },
  "6 Azagaias": { itemSlug: "javelin", quantity: 6, label: "6× Azagaia" },
  "2 Fantasias": {
    itemSlug: "roupas-fantasia",
    quantity: 2,
    label: "2× Roupas, Fantasia",
  },
  Costume: {
    itemSlug: "roupas-fantasia",
    quantity: 1,
    label: "Roupas, Fantasia",
  },
  "2 Algibeiras": {
    itemSlug: "algibeira",
    quantity: 2,
    label: "2× Algibeira",
  },
};

const TEXT_ONLY = new Set(["20 Flechas", "20 Virotes"]);

export function toolOptionsForPool(
  pool: EquipmentToolPool,
  catalog?: ToolPoolsCatalog,
): readonly ToolCatalogOption[] {
  return catalog?.[pool] ?? [];
}

export function toolNameForSlug(
  slug: string,
  pool?: EquipmentToolPool,
  catalog?: ToolPoolsCatalog,
): string | undefined {
  const pools: EquipmentToolPool[] = pool
    ? [pool]
    : ["instrument", "gaming", "artisan"];
  for (const p of pools) {
    const hit = toolOptionsForPool(p, catalog).find((o) => o.slug === slug);
    if (hit) return hit.name;
  }
  return undefined;
}

export function resolveEquipmentChoiceText(
  choiceText: string,
): ResolvedChoice {
  const text = choiceText.trim();

  const fixed = FIXED_CHOICE_MAP[text];
  if (fixed) {
    return {
      kind: "fixed",
      itemSlug: fixed.itemSlug,
      quantity: fixed.quantity,
      label: fixed.label,
    };
  }

  if (TEXT_ONLY.has(text)) {
    return { kind: "text", label: text };
  }

  const lower = text.toLowerCase();

  if (
    lower.includes("instrumento musical") &&
    (lower.includes("mesmo que acima") || lower.includes("mesma que acima"))
  ) {
    return {
      kind: "mirror-tool",
      pool: "instrument",
      label: "Instrumento musical (o da proficiência)",
    };
  }

  if (
    lower.includes("ferramentas de artesão") &&
    (lower.includes("mesmo que acima") || lower.includes("mesma que acima"))
  ) {
    return {
      kind: "mirror-tool",
      pool: "artisan",
      label: "Ferramentas de artesão (as da proficiência)",
    };
  }

  if (
    (lower.includes("kit de jogo") || lower.includes("kit de jogos")) &&
    (lower.includes("mesmo que acima") || lower.includes("mesma que acima"))
  ) {
    return {
      kind: "mirror-tool",
      pool: "gaming",
      label: "Kit de jogos (o da proficiência)",
    };
  }

  if (
    lower.includes("instrumento musical") &&
    lower.includes("escolha")
  ) {
    return {
      kind: "pick-tool",
      pool: "instrument",
      label: "Instrumento musical",
    };
  }

  if (
    (lower.includes("kit de jogo") || lower.includes("kit de jogos")) &&
    lower.includes("qualquer")
  ) {
    return {
      kind: "pick-tool",
      pool: "gaming",
      label: "Kit de jogos",
    };
  }

  return { kind: "text", label: text };
}

export function choicePickKey(
  source: "class" | "background",
  packageSlug: string,
  sortOrder: number,
): string {
  return `${source}:${packageSlug}:${sortOrder}`;
}
