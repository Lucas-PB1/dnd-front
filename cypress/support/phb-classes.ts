export const PHB_CLASSES = [
  "Bárbaro",
  "Bardo",
  "Bruxo",
  "Clérigo",
  "Druida",
  "Feiticeiro",
  "Guerreiro",
  "Ladino",
  "Mago",
  "Monge",
  "Paladino",
  "Patrulheiro",
] as const;

export type PhbClassName = (typeof PHB_CLASSES)[number];

/** Filtra por `CYPRESS_CLASS` (ex.: Bárbaro). */
export function filterPhbClasses(
  filter = (Cypress.env("CLASS") as string | undefined)?.trim(),
): PhbClassName[] {
  if (!filter) return [...PHB_CLASSES];
  const exact = PHB_CLASSES.filter((name) => name === filter);
  if (exact.length > 0) return exact;
  return PHB_CLASSES.filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );
}

/** Nome PT da classe → slug de catálogo. */
export const PHB_CLASS_SLUG: Record<PhbClassName, string> = {
  Bárbaro: "barbarian",
  Bardo: "bard",
  Bruxo: "warlock",
  Clérigo: "cleric",
  Druida: "druid",
  Feiticeiro: "sorcerer",
  Guerreiro: "fighter",
  Ladino: "rogue",
  Mago: "wizard",
  Monge: "monk",
  Paladino: "paladin",
  Patrulheiro: "ranger",
};

/**
 * Subclasse “mínima” para smoke 1→20 (poucas/nenhuma opção no unlock).
 * Hunter exige opções em L3/L7 — o helper API preenche com o 1º valor.
 */
export const PHB_PREFERRED_SUBCLASS: Record<PhbClassName, string> = {
  Bárbaro: "berserker",
  Bardo: "valor",
  Bruxo: "archfey",
  Clérigo: "life",
  Druida: "moon",
  Feiticeiro: "aberrant",
  Guerreiro: "psi-warrior",
  Ladino: "thief",
  Mago: "evoker",
  Monge: "open-hand",
  Paladino: "devotion",
  Patrulheiro: "hunter",
};

/** Perícias acadêmicas do mago (expertise). */
export const WIZARD_SCHOLAR_SKILLS = [
  "arcana",
  "history",
  "investigation",
  "medicine",
  "nature",
  "religion",
] as const;
