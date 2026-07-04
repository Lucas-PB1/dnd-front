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

export type WizardNavOptions = {
  skipSpells?: boolean;
  skipFeats?: boolean;
};

function shouldSkipStep(
  step: WizardStepId,
  options?: WizardNavOptions,
): boolean {
  if (step === "spells" && options?.skipSpells) return true;
  if (step === "feats" && options?.skipFeats) return true;
  return false;
}

export function visibleWizardSteps(options?: WizardNavOptions) {
  return WIZARD_STEPS.filter((step) => !shouldSkipStep(step.id, options));
}

export function wizardStepIndex(step: WizardStepId): number {
  return WIZARD_STEPS.findIndex((s) => s.id === step);
}

export function nextWizardStep(
  step: WizardStepId,
  options?: WizardNavOptions,
): WizardStepId | null {
  let index = wizardStepIndex(step);
  while (index < WIZARD_STEPS.length - 1) {
    index += 1;
    const candidate = WIZARD_STEPS[index]!.id;
    if (!shouldSkipStep(candidate, options)) return candidate;
  }
  return null;
}

export function prevWizardStep(
  step: WizardStepId,
  options?: WizardNavOptions,
): WizardStepId | null {
  let index = wizardStepIndex(step);
  while (index > 0) {
    index -= 1;
    const candidate = WIZARD_STEPS[index]!.id;
    if (!shouldSkipStep(candidate, options)) return candidate;
  }
  return null;
}
