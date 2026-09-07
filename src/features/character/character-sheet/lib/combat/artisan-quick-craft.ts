/** Tabela Fabricação Rápida (PHB Artesão) — espelha dnd-api artisan-craft.ts */

export const ARTISAN_CRAFT_ACTION = "artisan-craft" as const;
export const ARTISAN_FEAT_SLUG = "artisan" as const;

export const ARTISAN_QUICK_CRAFT_BY_TOOL: Readonly<
  Record<string, readonly string[]>
> = {
  "ferramentas-de-carpinteiro": ["escada", "tocha"],
  "ferramentas-de-coureiro": ["algibeira", "estojo-mapa-ou-pergaminho"],
  "ferramentas-de-entalhador": ["quarterstaff", "club", "greatclub"],
  "ferramentas-de-ferreiro": [
    "arpeu",
    "balde",
    "esferas-de-metal",
    "estrepes",
    "pote-ferro",
  ],
  "ferramentas-de-funileiro": ["caixa-para-fogo", "pa", "sino"],
  "ferramentas-de-oleiro": ["jarro-4-litros", "lampada"],
  "ferramentas-de-pedreiro": ["roldana-e-polias"],
  "ferramentas-de-tecelao": ["cesta", "corda", "rede", "tenda"],
};

const ITEM_LABELS: Readonly<Record<string, string>> = {
  escada: "Escada",
  tocha: "Tocha",
  algibeira: "Algibeira",
  "estojo-mapa-ou-pergaminho": "Estojo (mapa/pergaminho)",
  quarterstaff: "Cajado",
  club: "Clava",
  greatclub: "Clava Grande",
  arpeu: "Arpéu",
  balde: "Balde",
  "esferas-de-metal": "Esferas de Metal",
  estrepes: "Estrepes",
  "pote-ferro": "Pote de Ferro",
  "caixa-para-fogo": "Caixa para Fogo",
  pa: "Pá",
  sino: "Sino",
  "jarro-4-litros": "Jarro",
  lampada: "Lâmpada",
  "roldana-e-polias": "Roldana e Polias",
  cesta: "Cesta",
  corda: "Corda",
  rede: "Rede",
  tenda: "Tenda",
};

export function artisanCraftItemLabel(itemSlug: string): string {
  return ITEM_LABELS[itemSlug] ?? itemSlug;
}

export type ArtisanCraftOption = {
  itemSlug: string;
  label: string;
  toolSlug: string;
};

export function craftItemsForArtisanTools(
  toolSlugs: readonly string[],
): ArtisanCraftOption[] {
  const out: ArtisanCraftOption[] = [];
  const seen = new Set<string>();
  for (const tool of toolSlugs) {
    for (const itemSlug of ARTISAN_QUICK_CRAFT_BY_TOOL[tool] ?? []) {
      if (seen.has(itemSlug)) continue;
      seen.add(itemSlug);
      out.push({
        itemSlug,
        label: artisanCraftItemLabel(itemSlug),
        toolSlug: tool,
      });
    }
  }
  return out;
}

export function isArtisanCraftAction(
  featSlug: string | null | undefined,
  tableAction: string | null | undefined,
): boolean {
  return featSlug === ARTISAN_FEAT_SLUG && tableAction === ARTISAN_CRAFT_ACTION;
}
