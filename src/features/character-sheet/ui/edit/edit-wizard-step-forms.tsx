"use client";

import {
  SheetStepForm,
  type EditFormProps,
} from "@/features/character-sheet/ui/edit/edit-form-shell";
import { StepClassSkills } from "@/features/create-character/ui/steps/class-skills/step-class-skills";
import { StepEquipment } from "@/features/create-character/ui/steps/equipment/step-equipment";
import { StepSpeciesChoices } from "@/features/create-character/ui/steps/species/step-species-choices";
import { StepSubclassOptions } from "@/features/create-character/ui/steps/subclass/step-subclass-options";
import { StepSpells } from "@/features/create-character/ui/steps/spells/step-spells";

export function EditClassSkillsForm(props: EditFormProps) {
  return (
    <SheetStepForm
      {...props}
      toPayload={(v) => ({
        classSkillSlugs: v.classSkillSlugs,
        classOptions: v.classOptions,
      })}
    >
      {(form) => (
        <StepClassSkills control={form.control} setValue={form.setValue} />
      )}
    </SheetStepForm>
  );
}

export function EditSpeciesChoicesForm(props: EditFormProps) {
  return (
    <SheetStepForm
      {...props}
      toPayload={(v) => ({ speciesChoices: v.speciesChoices })}
    >
      {(form) => (
        <StepSpeciesChoices control={form.control} setValue={form.setValue} />
      )}
    </SheetStepForm>
  );
}

export function EditSubclassOptionsForm(props: EditFormProps) {
  return (
    <SheetStepForm
      {...props}
      toPayload={(v) => ({ subclassOptions: v.subclassOptions })}
    >
      {(form) => (
        <StepSubclassOptions control={form.control} setValue={form.setValue} />
      )}
    </SheetStepForm>
  );
}

export function EditSpellsForm(props: EditFormProps) {
  return (
    <SheetStepForm
      {...props}
      toPayload={(v) => ({ characterSpells: v.characterSpells })}
    >
      {(form) => <StepSpells control={form.control} setValue={form.setValue} />}
    </SheetStepForm>
  );
}

export function EditEquipmentForm(props: EditFormProps) {
  return (
    <SheetStepForm {...props} toPayload={(v) => ({ equipment: v.equipment })}>
      {(form) => (
        <StepEquipment control={form.control} setValue={form.setValue} />
      )}
    </SheetStepForm>
  );
}
