import type { BackgroundDefinition } from "@/domain/character-sheet/types/background";

export const PHB_2024_BACKGROUND_DETAILS_PART_ONE: BackgroundDefinition[] = [
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
];
