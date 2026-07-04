export const WIZARD_STEPS = [
  { id: "identity", label: "Identidade" },
  { id: "abilities", label: "Atributos" },
  { id: "skills", label: "Perícias" },
  { id: "background", label: "Antecedente" },
  { id: "feats", label: "Talentos" },
  { id: "species", label: "Espécie" },
  { id: "subclass", label: "Subclasse" },
  { id: "equipment", label: "Equipamento" },
  { id: "spells", label: "Magias" },
  { id: "languages", label: "Idiomas" },
  { id: "review", label: "Revisão" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function wizardStepIndex(step: WizardStepId): number {
  return WIZARD_STEPS.findIndex((s) => s.id === step);
}

export function nextWizardStep(step: WizardStepId): WizardStepId | null {
  const index = wizardStepIndex(step);
  return WIZARD_STEPS[index + 1]?.id ?? null;
}

export function prevWizardStep(step: WizardStepId): WizardStepId | null {
  const index = wizardStepIndex(step);
  return index > 0 ? WIZARD_STEPS[index - 1].id : null;
}
