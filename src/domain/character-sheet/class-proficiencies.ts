import type { Ability } from "@/domain/character-sheet/constants";
import {
  ABILITIES,
  SKILL_DEFINITIONS,
  type SkillKey,
} from "@/domain/character-sheet/constants";
import type { CharacterClassId } from "@/domain/character-sheet/classes";

export type ClassArmorTraining = {
  light: boolean;
  medium: boolean;
  heavy: boolean;
  shields: boolean;
};

export type ClassProficienciesDefinition = {
  id: CharacterClassId;
  savingThrows: readonly Ability[];
  skillChoiceCount: number;
  /** Lista fixa ou qualquer perícia (Bardo) */
  skillChoices: readonly SkillKey[] | "any";
  weaponsLabel: string;
  armorLabel: string;
  toolsLabel?: string;
  armorTraining: ClassArmorTraining;
  hitDie: string;
};

/** Livro do Jogador 2024 (PT-BR) — Cap. 3: Traços Básicos */
export const PHB_2024_CLASS_PROFICIENCIES: ClassProficienciesDefinition[] = [
  {
    id: "barbarian",
    savingThrows: ["strength", "constitution"],
    skillChoiceCount: 2,
    skillChoices: [
      "athletics",
      "intimidation",
      "animalHandling",
      "nature",
      "perception",
      "survival",
    ],
    weaponsLabel: "Armas Simples e Marciais",
    armorLabel: "Armaduras Leves e Médias e Escudos",
    armorTraining: { light: true, medium: true, heavy: false, shields: true },
    hitDie: "d12",
  },
  {
    id: "bard",
    savingThrows: ["dexterity", "charisma"],
    skillChoiceCount: 3,
    skillChoices: "any",
    weaponsLabel: "Armas Simples",
    armorLabel: "Armadura Leve",
    toolsLabel: "3 Instrumentos Musicais (escolha)",
    armorTraining: { light: true, medium: false, heavy: false, shields: false },
    hitDie: "d8",
  },
  {
    id: "warlock",
    savingThrows: ["wisdom", "charisma"],
    skillChoiceCount: 2,
    skillChoices: [
      "arcana",
      "deception",
      "history",
      "intimidation",
      "investigation",
      "nature",
      "religion",
    ],
    weaponsLabel: "Armas Simples",
    armorLabel: "Armadura Leve",
    armorTraining: { light: true, medium: false, heavy: false, shields: false },
    hitDie: "d8",
  },
  {
    id: "cleric",
    savingThrows: ["wisdom", "charisma"],
    skillChoiceCount: 2,
    skillChoices: ["history", "insight", "medicine", "persuasion", "religion"],
    weaponsLabel: "Armas Simples",
    armorLabel: "Armaduras Leves e Médias e Escudos",
    armorTraining: { light: true, medium: true, heavy: false, shields: true },
    hitDie: "d8",
  },
  {
    id: "druid",
    savingThrows: ["intelligence", "wisdom"],
    skillChoiceCount: 2,
    skillChoices: [
      "arcana",
      "animalHandling",
      "insight",
      "medicine",
      "nature",
      "perception",
      "religion",
      "survival",
    ],
    weaponsLabel: "Armas Simples",
    armorLabel: "Armadura Leve e Escudos",
    toolsLabel: "Kit de Herbalismo",
    armorTraining: { light: true, medium: false, heavy: false, shields: true },
    hitDie: "d8",
  },
  {
    id: "sorcerer",
    savingThrows: ["constitution", "charisma"],
    skillChoiceCount: 2,
    skillChoices: [
      "arcana",
      "deception",
      "intimidation",
      "insight",
      "persuasion",
      "religion",
    ],
    weaponsLabel: "Armas Simples",
    armorLabel: "Nenhuma",
    armorTraining: {
      light: false,
      medium: false,
      heavy: false,
      shields: false,
    },
    hitDie: "d6",
  },
  {
    id: "ranger",
    savingThrows: ["strength", "dexterity"],
    skillChoiceCount: 3,
    skillChoices: [
      "athletics",
      "stealth",
      "insight",
      "investigation",
      "animalHandling",
      "nature",
      "perception",
      "survival",
    ],
    weaponsLabel: "Armas Simples e Marciais",
    armorLabel: "Armaduras Leves, Médias e Escudos",
    armorTraining: { light: true, medium: true, heavy: false, shields: true },
    hitDie: "d10",
  },
  {
    id: "fighter",
    savingThrows: ["strength", "constitution"],
    skillChoiceCount: 2,
    skillChoices: [
      "acrobatics",
      "athletics",
      "history",
      "intimidation",
      "insight",
      "animalHandling",
      "perception",
      "persuasion",
      "survival",
    ],
    weaponsLabel: "Armas Simples e Marciais",
    armorLabel: "Armaduras Leves, Médias, Pesadas e Escudos",
    armorTraining: { light: true, medium: true, heavy: true, shields: true },
    hitDie: "d10",
  },
  {
    id: "rogue",
    savingThrows: ["dexterity", "intelligence"],
    skillChoiceCount: 4,
    skillChoices: [
      "acrobatics",
      "athletics",
      "deception",
      "stealth",
      "intimidation",
      "insight",
      "investigation",
      "perception",
      "persuasion",
      "sleightOfHand",
    ],
    weaponsLabel: "Armas Simples e Marciais (Acuidade ou Leve)",
    armorLabel: "Armadura Leve",
    toolsLabel: "Ferramentas de Ladrão",
    armorTraining: { light: true, medium: false, heavy: false, shields: false },
    hitDie: "d8",
  },
  {
    id: "wizard",
    savingThrows: ["intelligence", "wisdom"],
    skillChoiceCount: 2,
    skillChoices: [
      "arcana",
      "history",
      "insight",
      "investigation",
      "medicine",
      "nature",
      "religion",
    ],
    weaponsLabel: "Armas Simples",
    armorLabel: "Nenhuma",
    armorTraining: {
      light: false,
      medium: false,
      heavy: false,
      shields: false,
    },
    hitDie: "d6",
  },
  {
    id: "monk",
    savingThrows: ["strength", "dexterity"],
    skillChoiceCount: 2,
    skillChoices: [
      "acrobatics",
      "athletics",
      "stealth",
      "history",
      "insight",
      "religion",
    ],
    weaponsLabel: "Armas Simples e Marciais (Leve)",
    armorLabel: "Nenhuma",
    toolsLabel: "Ferramentas de Artesão ou Instrumento Musical (escolha)",
    armorTraining: {
      light: false,
      medium: false,
      heavy: false,
      shields: false,
    },
    hitDie: "d8",
  },
  {
    id: "paladin",
    savingThrows: ["wisdom", "charisma"],
    skillChoiceCount: 2,
    skillChoices: [
      "athletics",
      "intimidation",
      "insight",
      "medicine",
      "persuasion",
      "religion",
    ],
    weaponsLabel: "Armas Simples e Marciais",
    armorLabel: "Armaduras Leves, Médias, Pesadas e Escudos",
    armorTraining: { light: true, medium: true, heavy: true, shields: true },
    hitDie: "d10",
  },
];

export function findClassProficiencies(
  classId: string,
): ClassProficienciesDefinition | undefined {
  return PHB_2024_CLASS_PROFICIENCIES.find((entry) => entry.id === classId);
}

export function getClassSkillPool(
  definition: ClassProficienciesDefinition,
): SkillKey[] {
  if (definition.skillChoices === "any") {
    return SKILL_DEFINITIONS.map((skill) => skill.key);
  }

  return [...definition.skillChoices];
}

export function getProficiencyBonus(level: string): string {
  const numericLevel = Number.parseInt(level, 10);

  if (!Number.isFinite(numericLevel) || numericLevel < 1) {
    return "";
  }

  return String(Math.floor((numericLevel - 1) / 4) + 2);
}

export function formatClassHitDice(hitDie: string, level: string): string {
  const numericLevel = Number.parseInt(level, 10);

  if (!Number.isFinite(numericLevel) || numericLevel < 1) {
    return "";
  }

  return `${numericLevel}${hitDie}`;
}

export function isValidClassSkillSelection(
  definition: ClassProficienciesDefinition,
  selected: readonly string[],
): boolean {
  const pool = getClassSkillPool(definition);

  if (selected.length !== definition.skillChoiceCount) {
    return false;
  }

  return selected.every((skill) => pool.includes(skill as SkillKey));
}

export function getSavingThrowAbilities(classId: string): Ability[] {
  const definition = findClassProficiencies(classId);
  return definition ? [...definition.savingThrows] : [];
}

export function allSavingThrowPaths(): `savingThrows.${Ability}.proficient`[] {
  return ABILITIES.map((ability) => `savingThrows.${ability}.proficient`);
}
