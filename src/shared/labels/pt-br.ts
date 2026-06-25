import type { Ability } from "@/domain/character-sheet/constants/abilities";
import type { SkillKey } from "@/domain/character-sheet/constants/skills";

export const ABILITY_LABELS_PT: Record<Ability, string> = {
  strength: "Força",
  dexterity: "Destreza",
  constitution: "Constituição",
  intelligence: "Inteligência",
  wisdom: "Sabedoria",
  charisma: "Carisma",
};

export const SKILL_LABELS_PT: Record<SkillKey, string> = {
  acrobatics: "Acrobacia",
  animalHandling: "Lidar com Animais",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  deception: "Enganação",
  history: "História",
  insight: "Intuição",
  intimidation: "Intimidação",
  investigation: "Investigação",
  medicine: "Medicina",
  nature: "Natureza",
  perception: "Percepção",
  performance: "Atuação",
  persuasion: "Persuasão",
  religion: "Religião",
  sleightOfHand: "Prestidigitação",
  stealth: "Furtividade",
  survival: "Sobrevivência",
};
