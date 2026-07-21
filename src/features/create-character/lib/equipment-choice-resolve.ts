/**
 * Resolve `choice_text` do equipamento inicial PHB em itens/pickers.
 * O seed guarda muitas linhas só como texto (sem item_id).
 */

export type EquipmentToolPool = "instrument" | "gaming" | "artisan";

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
  "2 Algibeiras": {
    itemSlug: "algibeira",
    quantity: 2,
    label: "2× Algibeira",
  },
};

const TEXT_ONLY = new Set(["20 Flechas", "20 Virotes"]);

/** Opções de instrumento musical (PHB). */
export const INSTRUMENT_OPTIONS = [
  { slug: "alaude", name: "Alaúde" },
  { slug: "charamela", name: "Charamela" },
  { slug: "flauta", name: "Flauta" },
  { slug: "flauta-de-pan", name: "Flauta de Pã" },
  { slug: "gaita-de-foles", name: "Gaita de Foles" },
  { slug: "lira", name: "Lira" },
  { slug: "salterio", name: "Saltério" },
  { slug: "tambor", name: "Tambor" },
  { slug: "trompa", name: "Trompa" },
  { slug: "viola", name: "Viola" },
] as const;

/** Kits de jogos. */
export const GAMING_SET_OPTIONS = [
  { slug: "conjunto-de-dados", name: "Conjunto de Dados" },
  { slug: "baralho", name: "Baralho" },
  { slug: "xadrez-do-dragao", name: "Xadrez-do-Dragão" },
  { slug: "ante-dos-tres-dragoes", name: "Ante dos Três Dragões" },
] as const;

/** Ferramentas de artesão (variantes). */
export const ARTISAN_TOOL_OPTIONS = [
  { slug: "ferramentas-de-carpinteiro", name: "Ferramentas de Carpinteiro" },
  { slug: "ferramentas-de-cartografo", name: "Ferramentas de Cartógrafo" },
  { slug: "ferramentas-de-coureiro", name: "Ferramentas de Coureiro" },
  { slug: "ferramentas-de-entalhador", name: "Ferramentas de Entalhador" },
  { slug: "ferramentas-de-ferreiro", name: "Ferramentas de Ferreiro" },
  { slug: "ferramentas-de-funileiro", name: "Ferramentas de Funileiro" },
  { slug: "ferramentas-de-joalheiro", name: "Ferramentas de Joalheiro" },
  { slug: "ferramentas-de-oleiro", name: "Ferramentas de Oleiro" },
  { slug: "ferramentas-de-pedreiro", name: "Ferramentas de Pedreiro" },
  { slug: "ferramentas-de-sapateiro", name: "Ferramentas de Sapateiro" },
  { slug: "ferramentas-de-tecelao", name: "Ferramentas de Tecelão" },
  { slug: "ferramentas-de-vidreiro", name: "Ferramentas de Vidreiro" },
  { slug: "suprimentos-de-alquimista", name: "Suprimentos de Alquimista" },
  { slug: "suprimentos-de-caligrafo", name: "Suprimentos de Calígrafo" },
  { slug: "suprimentos-de-cervejeiro", name: "Suprimentos de Cervejeiro" },
  { slug: "suprimentos-de-pintor", name: "Suprimentos de Pintor" },
  { slug: "utensilios-de-cozinheiro", name: "Utensílios de Cozinheiro" },
] as const;

export function toolOptionsForPool(
  pool: EquipmentToolPool,
): readonly { slug: string; name: string }[] {
  if (pool === "instrument") return INSTRUMENT_OPTIONS;
  if (pool === "gaming") return GAMING_SET_OPTIONS;
  return ARTISAN_TOOL_OPTIONS;
}

export function toolNameForSlug(
  slug: string,
  pool?: EquipmentToolPool,
): string | undefined {
  const pools: EquipmentToolPool[] = pool
    ? [pool]
    : ["instrument", "gaming", "artisan"];
  for (const p of pools) {
    const hit = toolOptionsForPool(p).find((o) => o.slug === slug);
    if (hit) return hit.name;
  }
  return undefined;
}

/** Interpreta choice_text do seed. */
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
