import { z } from "zod";

import { SUBCLASS_UNLOCK_LEVEL_DEFAULT } from "@/entities/character/lib/subclass";
import { isAbilityPoolAssigned } from "@/features/character/create-character/lib/abilities/ability-pool";
import {
  isPointBuyValid,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
} from "@/features/character/create-character/lib/abilities/point-buy";

const SUBCLASS_UNLOCK_LEVEL = SUBCLASS_UNLOCK_LEVEL_DEFAULT;

const abilityScoresSchema = z.object({
  forca: z.number().int().min(0).max(30),
  destreza: z.number().int().min(0).max(30),
  constituicao: z.number().int().min(0).max(30),
  inteligencia: z.number().int().min(0).max(30),
  sabedoria: z.number().int().min(0).max(30),
  carisma: z.number().int().min(0).max(30),
});

const speciesChoiceSchema = z.object({
  choiceKind: z.string().min(1),
  choiceSlug: z.string().min(1),
});

const subclassOptionSchema = z.object({
  optionKey: z.string().min(1),
  valueId: z.string().min(1),
});

const classOptionSchema = z.object({
  optionKey: z.string().min(1),
  valueId: z.string().min(1),
  instanceIndex: z.number().int().min(0).optional(),
});

const featOptionSchema = z.object({
  featSlug: z.string().min(1),
  instanceIndex: z.number().int().min(0),
  optionKey: z.string().min(1),
  valueId: z.string().min(1),
});

const characterSpellSchema = z.object({
  spellSlug: z.string().min(1),
  listType: z.enum(["known", "prepared", "always_prepared"]),
});

const equipmentSchema = z.object({
  source: z.enum(["class", "background"]),
  packageSlug: z.string().min(1),
  itemSlug: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const abilityGenerationMethodSchema = z.enum([
  "standard-array",
  "roll",
  "point-buy",
]);

export const backgroundAbilityBoostModeSchema = z.enum([
  "plus2plus1",
  "plus1x3",
]);

export const createCharacterBaseSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(100),
  level: z.number().int().min(1, "Mínimo nível 1").max(20, "Máximo nível 20"),
  classSlug: z.string().min(1, "Escolha uma classe"),
  speciesSlug: z.string().min(1, "Escolha uma espécie"),
  backgroundSlug: z.string().min(1, "Escolha um antecedente"),
  subclassSlug: z.string().optional(),
  abilityGenerationMethodSlug: abilityGenerationMethodSchema,
  abilityScores: abilityScoresSchema,
  backgroundAbilityBoostMode: backgroundAbilityBoostModeSchema,
  backgroundAbilityBoostPlus2Slug: z.string().optional(),
  backgroundAbilityBoostPlus1Slug: z.string().optional(),
  backgroundAbilityBoostPlus1Slugs: z.array(z.string()).length(3).optional(),
  backgroundToolItemSlug: z.string().optional(),
  classSkillSlugs: z.array(z.string()),
  abilityRawValues: z.array(z.number().int()).length(6).optional(),
  speciesChoices: z.array(speciesChoiceSchema),
  subclassOptions: z.array(subclassOptionSchema),
  classOptions: z.array(classOptionSchema),
  featOptions: z.array(featOptionSchema),
  /** Um slug por marco ASI (níveis 4/8/12/16/19); vazio = +2/+1 em atributos */
  asiFeatSlotSlugs: z.array(z.string()),
  /** Talento de origem quando o antecedente permite escolha (feat_id NULL) */
  backgroundOriginFeatSlug: z.string().optional(),
  /** Estilo de luta L1 (feat fighting-style) quando a classe tem allowlist */
  fightingStyleFeatSlug: z.string().optional(),
  alignmentSlug: z.string().optional(),
  languageSlugs: z.array(z.string()),
  equipment: z.array(equipmentSchema),
  characterSpells: z.array(characterSpellSchema),
});

function refineSubclassRequired(
  data: { level: number; subclassSlug?: string },
  ctx: z.RefinementCtx,
) {
  if (data.level >= SUBCLASS_UNLOCK_LEVEL && !data.subclassSlug?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: `Subclasse obrigatória a partir do nível ${SUBCLASS_UNLOCK_LEVEL}`,
      path: ["subclassSlug"],
    });
  }
}

function refinePointBuy(
  data: {
    abilityGenerationMethodSlug: z.infer<typeof abilityGenerationMethodSchema>;
    abilityScores: z.infer<typeof abilityScoresSchema>;
  },
  ctx: z.RefinementCtx,
) {
  if (data.abilityGenerationMethodSlug === "point-buy") {
    if (!isPointBuyValid(data.abilityScores)) {
      ctx.addIssue({
        code: "custom",
        message: `Point-buy: use ${POINT_BUY_MIN}–${POINT_BUY_MAX} e gaste exatamente 27 pontos`,
        path: ["abilityScores"],
      });
    }
  }
}

function refineAbilityPool(
  data: {
    abilityGenerationMethodSlug: z.infer<typeof abilityGenerationMethodSchema>;
    abilityScores: z.infer<typeof abilityScoresSchema>;
    abilityRawValues?: number[];
  },
  ctx: z.RefinementCtx,
) {
  if (
    data.abilityGenerationMethodSlug !== "standard-array" &&
    data.abilityGenerationMethodSlug !== "roll"
  ) {
    return;
  }
  if (!data.abilityRawValues || data.abilityRawValues.length !== 6) {
    ctx.addIssue({
      code: "custom",
      message: "Gere ou escolha os valores antes de continuar",
      path: ["abilityRawValues"],
    });
    return;
  }
  if (!isAbilityPoolAssigned(data.abilityRawValues, data.abilityScores)) {
    ctx.addIssue({
      code: "custom",
      message: "Atribua cada valor do pool a um atributo (sem repetir além do disponível)",
      path: ["abilityScores"],
    });
  }
}

export const createCharacterSchema = createCharacterBaseSchema
  .superRefine(refineSubclassRequired)
  .superRefine(refinePointBuy)
  .superRefine(refineAbilityPool)
  .superRefine(refineBackgroundBoosts);

function refineBackgroundBoosts(
  data: {
    backgroundAbilityBoostMode?: "plus2plus1" | "plus1x3";
    backgroundAbilityBoostPlus2Slug?: string;
    backgroundAbilityBoostPlus1Slug?: string;
    backgroundAbilityBoostPlus1Slugs?: string[];
  },
  ctx: z.RefinementCtx,
) {
  const mode = data.backgroundAbilityBoostMode ?? "plus2plus1";

  if (mode === "plus1x3") {
    const slugs = (data.backgroundAbilityBoostPlus1Slugs ?? [])
      .map((slug) => slug?.trim())
      .filter((slug): slug is string => !!slug);
    if (slugs.length !== 3) {
      ctx.addIssue({
        code: "custom",
        message: "Escolha três atributos diferentes para +1",
        path: ["backgroundAbilityBoostPlus1Slugs"],
      });
      return;
    }
    if (new Set(slugs).size !== 3) {
      ctx.addIssue({
        code: "custom",
        message: "Os três atributos +1 devem ser distintos",
        path: ["backgroundAbilityBoostPlus1Slugs"],
      });
    }
    return;
  }

  const plus2 = data.backgroundAbilityBoostPlus2Slug?.trim();
  const plus1 = data.backgroundAbilityBoostPlus1Slug?.trim();
  if (!plus2) {
    ctx.addIssue({
      code: "custom",
      message: "Escolha o atributo +2 do antecedente",
      path: ["backgroundAbilityBoostPlus2Slug"],
    });
  }
  if (!plus1) {
    ctx.addIssue({
      code: "custom",
      message: "Escolha o atributo +1 do antecedente",
      path: ["backgroundAbilityBoostPlus1Slug"],
    });
  }
  if (plus2 && plus1 && plus2 === plus1) {
    ctx.addIssue({
      code: "custom",
      message: "+2 e +1 devem ser atributos diferentes",
      path: ["backgroundAbilityBoostPlus1Slug"],
    });
  }
}

export type CreateCharacterInput = z.infer<typeof createCharacterBaseSchema>;

export const identityStepSchema = createCharacterBaseSchema
  .pick({
    name: true,
    level: true,
    classSlug: true,
    speciesSlug: true,
    backgroundSlug: true,
    subclassSlug: true,
  })
  .superRefine(refineSubclassRequired);

export const abilitiesStepSchema = createCharacterBaseSchema
  .pick({
    abilityGenerationMethodSlug: true,
    abilityScores: true,
    abilityRawValues: true,
    backgroundAbilityBoostMode: true,
    backgroundAbilityBoostPlus2Slug: true,
    backgroundAbilityBoostPlus1Slug: true,
    backgroundAbilityBoostPlus1Slugs: true,
  })
  .superRefine(refinePointBuy)
  .superRefine(refineAbilityPool)
  .superRefine(refineBackgroundBoosts);

export const SUBCLASS_REQUIRED_FROM_LEVEL = SUBCLASS_UNLOCK_LEVEL;

export const LEVEL_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export const ABILITY_KEYS = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
] as const;
