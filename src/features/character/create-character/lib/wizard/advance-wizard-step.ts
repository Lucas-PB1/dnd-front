import type {
  UseFormGetValues,
  UseFormTrigger,
} from "react-hook-form";

import type { BackgroundSummary } from "@/entities/background/types";
import { classExpertiseSlotsAtLevel } from "@/entities/character/lib/class-expertise-slots";
import {
  classWeaponMasterySlotsAtLevel,
  type ClassProgressionMasteryRow,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import type {
  ClassSummary,
  SubclassOptionGroup,
} from "@/entities/class/types";
import type { SpeciesTraitChoice } from "@/entities/species/types";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { findIncompleteCreateFeatOptions } from "@/features/character/create-character/lib/feats/validate-create-feat-options";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import {
  abilitiesStepSchema,
  identityStepSchema,
  type CreateCharacterInput,
} from "@/features/character/create-character/model/create-character.schema";
import type { WizardStepId } from "@/features/character/create-character/model/wizard-steps";

export type WizardAdvanceDeps = {
  step: WizardStepId;
  getValues: UseFormGetValues<CreateCharacterInput>;
  trigger: UseFormTrigger<CreateCharacterInput>;
  setStep: (step: WizardStepId) => void;
  clearStepErrors: () => void;
  setAbilitiesError: (message: string | undefined) => void;
  setSkillsError: (message: string | undefined) => void;
  setBackgroundError: (message: string | undefined) => void;
  setSpeciesError: (message: string | undefined) => void;
  setFeatsError: (message: string | undefined) => void;
  setSubclassError: (message: string | undefined) => void;
  classDetail: ClassSummary | undefined;
  classProgression: ClassProgressionMasteryRow[] | undefined;
  backgroundDetail: BackgroundSummary | undefined;
  speciesTraitChoices: SpeciesTraitChoice[] | undefined;
  subclassOptions: SubclassOptionGroup[] | undefined;
  originFeatSlug: string;
  hasFightingStylePick: boolean;
  fightingStyleSlugs: string[];
  hasFeatsStep: boolean;
  hasSubclassStep: boolean;
  hasSpellStep: boolean;
};

/** Valida o passo atual e avança o wizard; retorna sem mudar o step se inválido. */
export async function advanceWizardStep(deps: WizardAdvanceDeps): Promise<void> {
  const {
    step,
    getValues,
    trigger,
    setStep,
    clearStepErrors,
    setAbilitiesError,
    setSkillsError,
    setBackgroundError,
    setSpeciesError,
    setFeatsError,
    setSubclassError,
    classDetail,
    classProgression,
    backgroundDetail,
    speciesTraitChoices,
    subclassOptions,
    originFeatSlug,
    hasFightingStylePick,
    fightingStyleSlugs,
    hasFeatsStep,
    hasSubclassStep,
    hasSpellStep,
  } = deps;

  clearStepErrors();

  if (step === "identity") {
    const valid = await trigger([
      "name",
      "level",
      "classSlug",
      "speciesSlug",
      "backgroundSlug",
      "subclassSlug",
    ]);
    if (!valid) return;
    if (!identityStepSchema.safeParse(getValues()).success) return;
    setStep("abilities");
    return;
  }

  if (step === "abilities") {
    const values = getValues();
    const parsed = abilitiesStepSchema.safeParse(values);
    if (!parsed.success) {
      setAbilitiesError(
        parsed.error.issues[0]?.message ??
          "Complete os atributos antes de continuar.",
      );
      return;
    }

    if (values.abilityGenerationMethodSlug === "point-buy") {
      const ok = await trigger("abilityScores");
      if (!ok) return;
    }

    const boostOk = await trigger([
      "backgroundAbilityBoostMode",
      "backgroundAbilityBoostPlus2Slug",
      "backgroundAbilityBoostPlus1Slug",
      "backgroundAbilityBoostPlus1Slugs",
    ]);
    if (!boostOk) {
      setAbilitiesError("Escolha a distribuição e os bônus do antecedente.");
      return;
    }

    setStep("skills");
    return;
  }

  if (step === "skills") {
    const values = getValues();
    const required = classDetail?.skillChoiceCount ?? 0;
    if (required > 0 && values.classSkillSlugs.length !== required) {
      setSkillsError(`Escolha exatamente ${required} perícia(s).`);
      return;
    }
    const expertiseSlots = classExpertiseSlotsAtLevel(
      values.classSlug,
      values.level,
    );
    if (expertiseSlots.length > 0) {
      const filled = new Set(
        (values.classOptions ?? [])
          .filter((option) => option.valueId)
          .map((option) => option.optionKey),
      );
      const missing = expertiseSlots.filter(
        (slot) => !filled.has(slot.optionKey),
      );
      if (missing.length > 0) {
        setSkillsError(
          `Escolha ${expertiseSlots.length} especialização(ões) de perícia.`,
        );
        return;
      }
    }
    const masterySlots = classWeaponMasterySlotsAtLevel(
      classProgression ?? [],
      values.level,
    );
    if (masterySlots.length > 0) {
      const filled = new Set(
        (values.classOptions ?? [])
          .filter((option) => option.valueId)
          .map((option) => option.optionKey),
      );
      const missing = masterySlots.filter(
        (slot) => !filled.has(slot.optionKey),
      );
      if (missing.length > 0) {
        setSkillsError(`Escolha ${masterySlots.length} maestria(s) em arma.`);
        return;
      }
    }
    setStep("background");
    return;
  }

  if (step === "background") {
    const values = getValues();
    if (!backgroundDetail) {
      setBackgroundError("Carregue o antecedente antes de continuar.");
      return;
    }
    if (
      backgroundDetail.toolProficiencyKind === "choice" &&
      !values.backgroundToolItemSlug?.trim()
    ) {
      setBackgroundError("Escolha a ferramenta do antecedente.");
      return;
    }
    setStep("species");
    return;
  }

  if (step === "species") {
    const values = getValues();
    const requiredKinds = [
      ...new Set((speciesTraitChoices ?? []).map((r) => r.choiceKind)),
    ];
    if (requiredKinds.length > 0) {
      const provided = values.speciesChoices.map((c) => c.choiceKind);
      const missing = requiredKinds.filter((k) => !provided.includes(k));
      if (missing.length > 0) {
        setSpeciesError("Complete todas as escolhas de traço da espécie.");
        return;
      }
    }
    setSpeciesError(undefined);
    setStep(hasFeatsStep ? "feats" : hasSubclassStep ? "subclass" : "equipment");
    return;
  }

  if (step === "feats") {
    const values = getValues();
    const fightingStyle = values.fightingStyleFeatSlug?.trim() ?? "";
    if (hasFightingStylePick && !fightingStyle) {
      setFeatsError("Escolha um Estilo de Luta.");
      return;
    }
    if (fightingStyle && !fightingStyleSlugs.includes(fightingStyle)) {
      setFeatsError("Estilo de Luta inválido para esta classe.");
      return;
    }
    const previewFeats = resolveCreateCharacterFeats(
      originFeatSlug || null,
      [
        ...asiFeatSlotsToCharacterFeats(values.asiFeatSlotSlugs ?? []),
        ...(fightingStyle
          ? [{ featSlug: fightingStyle, instanceIndex: 0 }]
          : []),
      ],
      values.speciesChoices ?? [],
    );
    if (previewFeats.length > 0) {
      const incomplete = await findIncompleteCreateFeatOptions(
        previewFeats,
        values.featOptions ?? [],
        {},
        values.level,
      );
      if (incomplete) {
        setFeatsError(incomplete);
        return;
      }
    }
    setFeatsError(undefined);
    setStep(hasSubclassStep ? "subclass" : "equipment");
    return;
  }

  if (step === "subclass") {
    const values = getValues();
    const requiredOptions = subclassOptions ?? [];
    if (requiredOptions.length > 0) {
      const provided = new Set(values.subclassOptions.map((o) => o.optionKey));
      const missing = requiredOptions.filter((o) => !provided.has(o.optionKey));
      if (missing.length > 0) {
        setSubclassError("Selecione todas as opções de subclasse.");
        return;
      }
    }
    setStep("equipment");
    return;
  }

  if (step === "equipment") {
    setStep(hasSpellStep ? "spells" : "languages");
    return;
  }

  if (step === "spells") {
    setStep("languages");
    return;
  }

  if (step === "languages") {
    setStep("review");
  }
}
