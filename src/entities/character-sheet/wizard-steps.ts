export const CHARACTER_WIZARD_STEPS = [
  {
    id: "identity",
    label: "Identidade",
    description: "Nome, espécie, antecedente e alinhamento.",
  },
  {
    id: "class",
    label: "Classe",
    description: "Classe, subclasse, nível e experiência.",
  },
  {
    id: "abilities",
    label: "Atributos",
    description: "Seis atributos e modificadores.",
  },
  {
    id: "proficiencies",
    label: "Proficiências",
    description: "Salvaguardas, perícias e treinamentos.",
  },
  {
    id: "combat",
    label: "Combate",
    description: "CA, PV, iniciativa e death saves.",
  },
  {
    id: "features",
    label: "Talentos",
    description: "Feats, traços de classe e espécie.",
  },
  {
    id: "equipment",
    label: "Equipamento",
    description: "Armas, inventário e moedas.",
  },
  {
    id: "spells",
    label: "Magia",
    description: "Conjuração, magias e slots.",
  },
  {
    id: "story",
    label: "História",
    description: "Aparência, personalidade e idiomas.",
  },
  {
    id: "review",
    label: "Revisão",
    description: "Confira a ficha completa antes de finalizar.",
  },
] as const;

export type CharacterWizardStepId =
  (typeof CHARACTER_WIZARD_STEPS)[number]["id"];

export const CHARACTER_WIZARD_STEP_COUNT = CHARACTER_WIZARD_STEPS.length;

export const REVIEW_STEP_INDEX = CHARACTER_WIZARD_STEPS.findIndex(
  (step) => step.id === "review",
);
