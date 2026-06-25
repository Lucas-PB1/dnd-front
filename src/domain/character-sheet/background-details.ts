import type { Ability } from "@/domain/character-sheet/constants";
import type { CharacterBackgroundId } from "@/domain/character-sheet/origins";
import type { SkillKey } from "@/domain/character-sheet/constants";

export type BackgroundAbilityMode = "split" | "even";

export type BackgroundDefinition = {
  id: CharacterBackgroundId;
  abilityOptions: readonly [Ability, Ability, Ability];
  originFeat: string;
  skills: readonly SkillKey[];
  toolsLabel: string;
};

/** Livro do Jogador 2024 (PT-BR) — Cap. 4: Antecedentes (p. 178–185) */
export const PHB_2024_BACKGROUND_DETAILS: BackgroundDefinition[] = [
  {
    id: "acolyte",
    abilityOptions: ["intelligence", "wisdom", "charisma"],
    originFeat: "Iniciado em Magia (Clérigo)",
    skills: ["insight", "religion"],
    toolsLabel: "Suprimentos de Calígrafo",
  },
  {
    id: "wanderer",
    abilityOptions: ["dexterity", "wisdom", "charisma"],
    originFeat: "Sortudo",
    skills: ["stealth", "insight"],
    toolsLabel: "Ferramentas de Ladrão",
  },
  {
    id: "artisan",
    abilityOptions: ["strength", "dexterity", "intelligence"],
    originFeat: "Artifista",
    skills: ["investigation", "persuasion"],
    toolsLabel: "Ferramentas de Artesão (escolha)",
  },
  {
    id: "entertainer",
    abilityOptions: ["strength", "dexterity", "charisma"],
    originFeat: "Músico",
    skills: ["acrobatics", "performance"],
    toolsLabel: "Instrumento Musical (escolha)",
  },
  {
    id: "charlatan",
    abilityOptions: ["dexterity", "constitution", "charisma"],
    originFeat: "Habilidoso",
    skills: ["deception", "sleightOfHand"],
    toolsLabel: "Kit de Falsificação",
  },
  {
    id: "criminal",
    abilityOptions: ["dexterity", "constitution", "intelligence"],
    originFeat: "Alerta",
    skills: ["stealth", "sleightOfHand"],
    toolsLabel: "Ferramentas de Ladrão",
  },
  {
    id: "hermit",
    abilityOptions: ["constitution", "wisdom", "charisma"],
    originFeat: "Curandeiro",
    skills: ["medicine", "religion"],
    toolsLabel: "Kit de Herbalismo",
  },
  {
    id: "scribe",
    abilityOptions: ["dexterity", "intelligence", "wisdom"],
    originFeat: "Habilidoso",
    skills: ["investigation", "perception"],
    toolsLabel: "Suprimentos de Calígrafo",
  },
  {
    id: "farmer",
    abilityOptions: ["strength", "constitution", "wisdom"],
    originFeat: "Vigoroso",
    skills: ["animalHandling", "nature"],
    toolsLabel: "Ferramentas de Carpinteiro",
  },
  {
    id: "guard",
    abilityOptions: ["strength", "intelligence", "wisdom"],
    originFeat: "Alerta",
    skills: ["athletics", "perception"],
    toolsLabel: "Kit de Jogos (escolha)",
  },
  {
    id: "guide",
    abilityOptions: ["dexterity", "constitution", "wisdom"],
    originFeat: "Iniciado em Magia (Druida)",
    skills: ["stealth", "survival"],
    toolsLabel: "Ferramentas de Cartógrafo",
  },
  {
    id: "sailor",
    abilityOptions: ["strength", "dexterity", "wisdom"],
    originFeat: "Valentão de Taverna",
    skills: ["acrobatics", "perception"],
    toolsLabel: "Ferramentas de Navegador",
  },
  {
    id: "merchant",
    abilityOptions: ["constitution", "intelligence", "charisma"],
    originFeat: "Sortudo",
    skills: ["animalHandling", "persuasion"],
    toolsLabel: "Ferramentas de Navegador",
  },
  {
    id: "noble",
    abilityOptions: ["strength", "intelligence", "charisma"],
    originFeat: "Habilidoso",
    skills: ["history", "persuasion"],
    toolsLabel: "Kit de Jogos (escolha)",
  },
  {
    id: "sage",
    abilityOptions: ["constitution", "intelligence", "wisdom"],
    originFeat: "Iniciado em Magia (Mago)",
    skills: ["arcana", "history"],
    toolsLabel: "Suprimentos de Calígrafo",
  },
  {
    id: "soldier",
    abilityOptions: ["strength", "dexterity", "constitution"],
    originFeat: "Atacante Selvagem",
    skills: ["athletics", "intimidation"],
    toolsLabel: "Kit de Jogos (escolha)",
  },
];

export function findBackgroundDetails(
  backgroundId: string,
): BackgroundDefinition | undefined {
  return PHB_2024_BACKGROUND_DETAILS.find((entry) => entry.id === backgroundId);
}

export function getBackgroundAbilityBonuses(
  backgroundId: string,
  mode: BackgroundAbilityMode,
  plus2: string,
  plus1: string,
): Record<Ability, number> {
  const definition = findBackgroundDetails(backgroundId);
  const bonuses = Object.fromEntries(
    (
      [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
      ] as const
    ).map((ability) => [ability, 0]),
  ) as Record<Ability, number>;

  if (!definition) {
    return bonuses;
  }

  if (mode === "even") {
    for (const ability of definition.abilityOptions) {
      bonuses[ability] += 1;
    }
    return bonuses;
  }

  if (
    plus2 &&
    definition.abilityOptions.includes(plus2 as Ability) &&
    plus2 !== plus1
  ) {
    bonuses[plus2 as Ability] += 2;
  }

  if (
    plus1 &&
    definition.abilityOptions.includes(plus1 as Ability) &&
    plus1 !== plus2
  ) {
    bonuses[plus1 as Ability] += 1;
  }

  return bonuses;
}

export function isBackgroundAbilitySelectionComplete(
  backgroundId: string,
  mode: BackgroundAbilityMode,
  plus2: string,
  plus1: string,
): boolean {
  const definition = findBackgroundDetails(backgroundId);

  if (!definition) {
    return false;
  }

  if (mode === "even") {
    return true;
  }

  return (
    Boolean(plus2) &&
    Boolean(plus1) &&
    plus2 !== plus1 &&
    definition.abilityOptions.includes(plus2 as Ability) &&
    definition.abilityOptions.includes(plus1 as Ability)
  );
}

export const ABILITY_LABELS_PT: Record<Ability, string> = {
  strength: "Força",
  dexterity: "Destreza",
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma",
};
