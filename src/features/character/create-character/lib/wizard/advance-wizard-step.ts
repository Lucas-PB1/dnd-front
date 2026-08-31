import type {
  UseFormGetValues,
  UseFormTrigger,
} from "react-hook-form";

import type { BackgroundSummary } from "@/entities/background/types";
import { classExpertiseSlotsAtLevel } from "@/entities/character/lib/class-expertise-slots";
import { classExtraSkillSlotsAtLevel } from "@/entities/character/lib/class-extra-skill-slots";
import { mysticArcanumSlotsAtLevel } from "@/entities/character/lib/mystic-arcanum";
import { signatureSpellKeysAtLevel } from "@/entities/character/lib/signature-spells";
import {
  classWeaponMasterySlotsAtLevel,
  type ClassProgressionMasteryRow,
} from "@/entities/character/lib/class-weapon-mastery-slots";
import type {
  ClassFeatureOptionGroup,
  ClassSummary,
  SubclassOptionGroup,
} from "@/entities/class/types";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { findIncompleteCreateFeatOptions } from "@/features/character/create-character/lib/feats/validate-create-feat-options";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";
import {
  abilitiesStepSchema,
  identityStepSchema,
  type CreateCharacterInput,
} from "@/features/character/create-character/model/create-character.schema";
import type { WizardStepId } from "@/features/character/create-character/model/wizard-steps";
import {
  SPELL_MASTERY_LEVEL_1_KEY,
  SPELL_MASTERY_LEVEL_2_KEY,
  SPELL_MASTERY_UNLOCK_LEVEL,
} from "@/features/character/character-sheet/lib/spells/spell-mastery";
import {
  readEldritchInvocationSlugs,
  warlockInvocationLimit,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import {
  readMetamagicSlugs,
  sorcererMetamagicLimit,
} from "@/features/character/character-sheet/lib/sorcerer/metamagic";

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
  setClassFeaturesError: (message: string | undefined) => void;
  classDetail: ClassSummary | undefined;
  classProgression: ClassProgressionMasteryRow[] | undefined;
  backgroundDetail: BackgroundSummary | undefined;
  speciesTraitChoices: Array<{ choiceKind: string }> | undefined;
  subclassOptions: SubclassOptionGroup[] | undefined;
  classFeatureOptions: ClassFeatureOptionGroup[] | undefined;
  originFeatSlug: string;
  hasFightingStylePick: boolean;
  fightingStyleSlugs: string[];
  hasFeatsStep: boolean;
  hasSubclassStep: boolean;
  hasClassFeaturesStep: boolean;
  hasSpellStep: boolean;
  hasInvocationsStep: boolean;
  hasMetamagicsStep: boolean;
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
    setClassFeaturesError,
    classDetail,
    classProgression,
    backgroundDetail,
    speciesTraitChoices,
    subclassOptions,
    classFeatureOptions,
    originFeatSlug,
    hasFightingStylePick,
    fightingStyleSlugs,
    hasFeatsStep,
    hasSubclassStep,
    hasClassFeaturesStep,
    hasSpellStep,
    hasInvocationsStep,
    hasMetamagicsStep,
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
    const extraSkillSlots = classExtraSkillSlotsAtLevel(
      values.classSlug,
      values.level,
    );
    if (extraSkillSlots.length > 0) {
      const filled = new Set(
        (values.classOptions ?? [])
          .filter((option) => option.valueId)
          .map((option) => option.optionKey),
      );
      const missing = extraSkillSlots.filter(
        (slot) => !filled.has(slot.optionKey),
      );
      if (missing.length > 0) {
        setSkillsError("Escolha a perícia extra de Conhecimento Primordial.");
        return;
      }
    }
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
    setStep("thread");
    return;
  }

  if (step === "thread") {
    setStep("species");
    return;
  }

  if (step === "species") {
    const values = getValues();
    const originChoices = values.heritageSlug?.trim()
      ? (values.heritageChoices ?? [])
      : values.speciesChoices;
    const elfLineage = values.speciesChoices.find(
      (c) => c.choiceKind === "elf_lineage",
    )?.choiceSlug;
    const bearfolkLineage = values.speciesChoices.find(
      (c) => c.choiceKind === "bearfolk_lineage",
    )?.choiceSlug;
    const ghSpeedTrade = originChoices.find(
      (c) =>
        c.choiceKind === "heritage_speed_trade" ||
        c.choiceKind === "gh_heritage_speed_trade",
    )?.choiceSlug;
    const requiredKinds = [
      ...new Set((speciesTraitChoices ?? []).map((r) => r.choiceKind)),
    ].filter((kind) => {
      if (kind === "high_elf_cantrip") return elfLineage === "high-elf";
      if (kind === "andari_druid_cantrip") return bearfolkLineage === "andari";
      if (kind === "heritage_trait_9" || kind === "gh_heritage_trait_9") {
        return ghSpeedTrade === "yes";
      }
      return true;
    });
    if (requiredKinds.length > 0) {
      const provided = originChoices.map((c) => c.choiceKind);
      const missing = requiredKinds.filter((k) => !provided.includes(k));
      if (missing.length > 0) {
        setSpeciesError("Complete todas as escolhas de traço da espécie.");
        return;
      }
    }
    setSpeciesError(undefined);
    setStep(
      hasFeatsStep
        ? "feats"
        : hasClassFeaturesStep
          ? "classFeatures"
          : hasSubclassStep
            ? "subclass"
            : "equipment",
    );
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
    const originChoices = backgroundDetail?.originFeatChoiceSlugs ?? [];
    const originPick = values.backgroundOriginFeatSlug?.trim() ?? "";
    if (!originFeatSlug && originChoices.length > 0) {
      if (!originPick || !originChoices.includes(originPick)) {
        setFeatsError("Escolha o talento de origem do antecedente.");
        return;
      }
    }
    const effectiveOriginFeatSlug = originFeatSlug || originPick;
    const previewFeats = resolveCreateCharacterFeats(
      effectiveOriginFeatSlug || null,
      [
        ...asiFeatSlotsToCharacterFeats(values.asiFeatSlotSlugs ?? []),
        ...(fightingStyle
          ? [{ featSlug: fightingStyle, instanceIndex: 0 }]
          : []),
      ],
      values.speciesChoices ?? [],
      values.classOptions ?? [],
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
    setStep(
      hasClassFeaturesStep
        ? "classFeatures"
        : hasSubclassStep
          ? "subclass"
          : "equipment",
    );
    return;
  }

  if (step === "classFeatures") {
    const values = getValues();
    const requiredOptions = classFeatureOptions ?? [];
    if (requiredOptions.length > 0) {
      const provided = new Set(
        (values.classOptions ?? []).map((option) => option.optionKey),
      );
      const missing = requiredOptions.filter(
        (option) => !provided.has(option.optionKey),
      );
      if (missing.length > 0) {
        setClassFeaturesError("Selecione todas as características de classe.");
        return;
      }
    }
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
    setStep(
      hasSpellStep
        ? "spells"
        : hasInvocationsStep
          ? "invocations"
          : hasMetamagicsStep
            ? "metamagics"
            : "languages",
    );
    return;
  }

  if (step === "spells") {
    const values = getValues();
    const filled = new Set(
      (values.classOptions ?? [])
        .filter((option) => option.valueId)
        .map((option) => option.optionKey),
    );
    if (
      values.classSlug === "wizard" &&
      values.level >= SPELL_MASTERY_UNLOCK_LEVEL
    ) {
      const missing = [SPELL_MASTERY_LEVEL_1_KEY, SPELL_MASTERY_LEVEL_2_KEY].filter(
        (key) => !filled.has(key),
      );
      if (missing.length > 0) {
        setClassFeaturesError("Escolha as duas magias de Maestria de Magias.");
        return;
      }
    }
    const signatureKeys = signatureSpellKeysAtLevel(
      values.classSlug === "wizard" ? values.level : 0,
    );
    if (signatureKeys.some((key) => !filled.has(key))) {
      setClassFeaturesError("Escolha as duas magias de Assinatura Mágica.");
      return;
    }
    const arcanumKeys = mysticArcanumSlotsAtLevel(
      values.classSlug === "warlock" ? values.level : 0,
    ).map((slot) => slot.optionKey);
    if (arcanumKeys.some((key) => !filled.has(key))) {
      setClassFeaturesError("Escolha todas as magias de Arcana Mística.");
      return;
    }
    setClassFeaturesError(undefined);
    setStep(
      hasInvocationsStep
        ? "invocations"
        : hasMetamagicsStep
          ? "metamagics"
          : "languages",
    );
    return;
  }

  if (step === "invocations") {
    const values = getValues();
    const limit = warlockInvocationLimit(values.level);
    const picks = readEldritchInvocationSlugs(values.classOptions ?? []);
    if (picks.length !== limit) {
      setSubclassError(
        `Escolha exatamente ${limit} invocação(ões) mística(s) para o nível ${values.level}.`,
      );
      return;
    }
    setSubclassError(undefined);
    setStep("languages");
    return;
  }

  if (step === "metamagics") {
    const values = getValues();
    const limit = sorcererMetamagicLimit(values.level);
    const picks = readMetamagicSlugs(values.classOptions ?? []);
    if (picks.length !== limit) {
      setSubclassError(
        `Escolha exatamente ${limit} opção(ões) de Metamagia para o nível ${values.level}.`,
      );
      return;
    }
    setSubclassError(undefined);
    setStep("languages");
    return;
  }

  if (step === "languages") {
    setStep("review");
  }
}
