import type { BackgroundDefinition } from "@/entities/character-sheet/types/background";

export const PHB_2024_BACKGROUND_DETAILS_PART_TWO: BackgroundDefinition[] = [
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
