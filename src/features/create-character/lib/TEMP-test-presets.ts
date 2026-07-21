/**
 * TEMPORÁRIO — presets de ficha para teste local (dev only).
 * Cada preset é um CreateCharacterInput completo o bastante para POST /characters.
 */

import type { UseFormSetValue } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import type { WizardStepId } from "@/features/create-character/model/wizard-steps";

export type TempTestPreset = {
  id: string;
  /** Rótulo curto no botão */
  label: string;
  /** Uma linha de contexto (classe · espécie · nv.) */
  hint: string;
  /** Para onde o wizard salta ao autopreencher */
  targetStep: WizardStepId;
  values: CreateCharacterInput;
};

const ASI_PLUS2 = (
  ability: string,
): CreateCharacterInput["featOptions"] => [
  {
    featSlug: "ability-score-improvement",
    instanceIndex: 0,
    optionKey: "distributionMode",
    valueId: "plus2",
  },
  {
    featSlug: "ability-score-improvement",
    instanceIndex: 0,
    optionKey: "primaryAbility",
    valueId: ability,
  },
];

const pkg = (source: "class" | "background", packageSlug = "a") => [
  { source, packageSlug, sortOrder: 0 },
];

export const TEMP_TEST_PRESETS: TempTestPreset[] = [
  {
    id: "fighter-champion",
    label: "Guerreiro Campeão",
    hint: "Anão · Soldado · nv.5",
    targetStep: "review",
    values: {
      name: "TEMP — Thorin Campeão",
      level: 5,
      classSlug: "fighter",
      speciesSlug: "dwarf",
      backgroundSlug: "soldier",
      subclassSlug: "champion",
      alignmentSlug: "lawful-good",
      abilityGenerationMethodSlug: "standard-array",
      abilityScores: {
        forca: 15,
        destreza: 13,
        constituicao: 14,
        inteligencia: 8,
        sabedoria: 12,
        carisma: 10,
      },
      backgroundAbilityBoostPlus2Slug: "forca",
      backgroundAbilityBoostPlus1Slug: "constituicao",
      backgroundToolItemSlug: "conjunto-de-dados",
      classSkillSlugs: ["perception", "insight"],
      abilityRawValues: undefined,
      speciesChoices: [],
      subclassOptions: [],
      asiFeatSlotSlugs: ["ability-score-improvement"],
      featOptions: [...ASI_PLUS2("forca")],
      languageSlugs: ["common", "dwarvish"],
      characterSpells: [],
      equipment: [...pkg("class"), ...pkg("background")],
    },
  },
  {
    id: "barbarian-berserker",
    label: "Bárbaro Berserker",
    hint: "Orc · Criminoso · nv.5",
    targetStep: "review",
    values: {
      name: "TEMP — Grak Berserker",
      level: 5,
      classSlug: "barbarian",
      speciesSlug: "orc",
      backgroundSlug: "criminal",
      subclassSlug: "berserker",
      alignmentSlug: "chaotic-neutral",
      abilityGenerationMethodSlug: "standard-array",
      abilityScores: {
        forca: 15,
        destreza: 13,
        constituicao: 14,
        inteligencia: 8,
        sabedoria: 12,
        carisma: 10,
      },
      backgroundAbilityBoostPlus2Slug: "constituicao",
      backgroundAbilityBoostPlus1Slug: "destreza",
      classSkillSlugs: ["athletics", "survival"],
      abilityRawValues: undefined,
      speciesChoices: [],
      subclassOptions: [],
      asiFeatSlotSlugs: ["ability-score-improvement"],
      featOptions: [...ASI_PLUS2("forca")],
      languageSlugs: ["common", "orc"],
      characterSpells: [],
      equipment: [...pkg("class"), ...pkg("background")],
    },
  },
  {
    id: "rogue-thief",
    label: "Ladino Ladrão",
    hint: "Anão · Criminoso · nv.5",
    targetStep: "review",
    values: {
      name: "TEMP — Nyx Ladrão",
      level: 5,
      classSlug: "rogue",
      speciesSlug: "dwarf",
      backgroundSlug: "criminal",
      subclassSlug: "thief",
      alignmentSlug: "chaotic-neutral",
      abilityGenerationMethodSlug: "standard-array",
      abilityScores: {
        forca: 8,
        destreza: 15,
        constituicao: 14,
        inteligencia: 13,
        sabedoria: 12,
        carisma: 10,
      },
      backgroundAbilityBoostPlus2Slug: "destreza",
      backgroundAbilityBoostPlus1Slug: "constituicao",
      classSkillSlugs: [
        "acrobatics",
        "deception",
        "perception",
        "investigation",
      ],
      abilityRawValues: undefined,
      speciesChoices: [],
      subclassOptions: [],
      asiFeatSlotSlugs: ["ability-score-improvement"],
      featOptions: [...ASI_PLUS2("destreza")],
      languageSlugs: ["common", "dwarvish"],
      characterSpells: [],
      equipment: [...pkg("class"), ...pkg("background")],
    },
  },
  {
    id: "sorcerer-draconic",
    label: "Feiticeiro Dracônico",
    hint: "Draconato · Artista · nv.6",
    targetStep: "spells",
    values: {
      name: "TEMP — Draco Feiticeiro",
      level: 6,
      classSlug: "sorcerer",
      speciesSlug: "dragonborn",
      backgroundSlug: "entertainer",
      subclassSlug: "draconic",
      alignmentSlug: "chaotic-good",
      abilityGenerationMethodSlug: "standard-array",
      abilityScores: {
        forca: 8,
        destreza: 13,
        constituicao: 14,
        inteligencia: 10,
        sabedoria: 12,
        carisma: 15,
      },
      backgroundAbilityBoostPlus2Slug: "carisma",
      backgroundAbilityBoostPlus1Slug: "destreza",
      backgroundToolItemSlug: "alaude",
      classSkillSlugs: ["arcana", "deception"],
      abilityRawValues: undefined,
      speciesChoices: [{ choiceKind: "dragon_ancestry", choiceSlug: "red" }],
      subclassOptions: [{ optionKey: "elementalAffinity", valueId: "fire" }],
      asiFeatSlotSlugs: ["ability-score-improvement"],
      featOptions: [
        {
          featSlug: "musician",
          instanceIndex: 0,
          optionKey: "musicalInstrument1",
          valueId: "flauta",
        },
        {
          featSlug: "musician",
          instanceIndex: 0,
          optionKey: "musicalInstrument2",
          valueId: "tambor",
        },
        {
          featSlug: "musician",
          instanceIndex: 0,
          optionKey: "musicalInstrument3",
          valueId: "lira",
        },
        ...ASI_PLUS2("carisma"),
      ],
      languageSlugs: ["common", "draconic"],
      characterSpells: [
        { spellSlug: "raio-de-fogo", listType: "known" },
        { spellSlug: "prestidigitacao-arcana", listType: "known" },
        { spellSlug: "luz", listType: "known" },
        { spellSlug: "luzes-dancantes", listType: "known" },
        { spellSlug: "escudo-arcano", listType: "known" },
        { spellSlug: "sono", listType: "known" },
        { spellSlug: "invisibilidade", listType: "known" },
        { spellSlug: "bola-de-fogo", listType: "known" },
      ],
      equipment: [...pkg("class"), ...pkg("background")],
    },
  },
  {
    id: "cleric-life-l1",
    label: "Clérigo Vida (nv.1)",
    hint: "Anão · Acólito · sem subclasse",
    targetStep: "review",
    values: {
      name: "TEMP — Bruenor Acólito",
      level: 1,
      classSlug: "cleric",
      speciesSlug: "dwarf",
      backgroundSlug: "acolyte",
      subclassSlug: "",
      alignmentSlug: "lawful-good",
      abilityGenerationMethodSlug: "standard-array",
      abilityScores: {
        forca: 13,
        destreza: 10,
        constituicao: 14,
        inteligencia: 8,
        sabedoria: 15,
        carisma: 12,
      },
      backgroundAbilityBoostPlus2Slug: "sabedoria",
      backgroundAbilityBoostPlus1Slug: "carisma",
      classSkillSlugs: ["medicine", "persuasion"],
      abilityRawValues: undefined,
      speciesChoices: [],
      subclassOptions: [],
      asiFeatSlotSlugs: [],
      featOptions: [
        {
          featSlug: "magic-initiate",
          instanceIndex: 0,
          optionKey: "spellList",
          valueId: "cleric",
        },
        {
          featSlug: "magic-initiate",
          instanceIndex: 0,
          optionKey: "castingAbility",
          valueId: "sabedoria",
        },
        {
          featSlug: "magic-initiate",
          instanceIndex: 0,
          optionKey: "cantrip1",
          valueId: "orientacao",
        },
        {
          featSlug: "magic-initiate",
          instanceIndex: 0,
          optionKey: "cantrip2",
          valueId: "luz",
        },
        {
          featSlug: "magic-initiate",
          instanceIndex: 0,
          optionKey: "firstLevelSpell",
          valueId: "curar-ferimentos",
        },
      ],
      languageSlugs: ["common", "dwarvish"],
      characterSpells: [
        { spellSlug: "orientacao", listType: "prepared" },
        { spellSlug: "luz", listType: "prepared" },
        { spellSlug: "chama-sagrada", listType: "prepared" },
        { spellSlug: "curar-ferimentos", listType: "prepared" },
        { spellSlug: "bencao", listType: "prepared" },
        { spellSlug: "escudo-da-fe", listType: "prepared" },
      ],
      equipment: [...pkg("class"), ...pkg("background")],
    },
  },
];

export type TempAutofillApply = {
  setValue: UseFormSetValue<CreateCharacterInput>;
  setStep: (step: WizardStepId) => void;
};

export function applyTempTestPreset(
  preset: TempTestPreset,
  { setValue, setStep }: TempAutofillApply,
) {
  (Object.keys(preset.values) as (keyof CreateCharacterInput)[]).forEach(
    (key) => {
      setValue(key, preset.values[key], {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
  );
  setStep(preset.targetStep);
}

/** @deprecated use TEMP_TEST_PRESETS + applyTempTestPreset */
export const TEMP_DRACONIC_SORCERER_AUTOFILL = {
  label: "⚠ TEMP · Autopreencher → Magias (Feiticeiro Dracônico)",
  targetStep: "spells" as const satisfies WizardStepId,
  values: TEMP_TEST_PRESETS.find((p) => p.id === "sorcerer-draconic")!.values,
};

/** @deprecated */
export function applyTempDraconicSorcererAutofill(args: TempAutofillApply) {
  const preset = TEMP_TEST_PRESETS.find((p) => p.id === "sorcerer-draconic")!;
  applyTempTestPreset(preset, args);
}
