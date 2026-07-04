import { z } from "zod";

import { SUBCLASS_UNLOCK_LEVEL_DEFAULT } from "@/entities/character/lib/subclass";
import {
  isPointBuyValid,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
} from "@/features/create-character/lib/point-buy";

const SUBCLASS_UNLOCK_LEVEL = SUBCLASS_UNLOCK_LEVEL_DEFAULT;

const abilityScoresSchema = z.object({
  forca: z.number().int().min(1).max(30),
  destreza: z.number().int().min(1).max(30),
  constituicao: z.number().int().min(1).max(30),
  inteligencia: z.number().int().min(1).max(30),
  sabedoria: z.number().int().min(1).max(30),
  carisma: z.number().int().min(1).max(30),
});

const speciesChoiceSchema = z.object({
  choiceKind: z.string().min(1),
  choiceSlug: z.string().min(1),
});

const subclassOptionSchema = z.object({
  optionKey: z.string().min(1),
  valueId: z.string().min(1),
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

export const createCharacterBaseSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(100),
  level: z.number().int().min(1, "Mínimo nível 1").max(20, "Máximo nível 20"),
  classSlug: z.string().min(1, "Escolha uma classe"),
  speciesSlug: z.string().min(1, "Escolha uma espécie"),
  backgroundSlug: z.string().min(1, "Escolha um antecedente"),
  subclassSlug: z.string().optional(),
  abilityGenerationMethodSlug: abilityGenerationMethodSchema,
  abilityScores: abilityScoresSchema,
  backgroundAbilityBoostPlus2Slug: z.string().optional(),
  backgroundAbilityBoostPlus1Slug: z.string().optional(),
  backgroundToolItemSlug: z.string().optional(),
  classSkillSlugs: z.array(z.string()),
  abilityRawValues: z.array(z.number().int()).length(6).optional(),
  speciesChoices: z.array(speciesChoiceSchema),
  subclassOptions: z.array(subclassOptionSchema),
  featOptions: z.array(featOptionSchema),
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

export const createCharacterSchema = createCharacterBaseSchema
  .superRefine(refineSubclassRequired)
  .superRefine(refinePointBuy)
  .superRefine(refineBackgroundBoosts);

function refineBackgroundBoosts(
  data: {
    backgroundAbilityBoostPlus2Slug?: string;
    backgroundAbilityBoostPlus1Slug?: string;
  },
  ctx: z.RefinementCtx,
) {
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
    backgroundAbilityBoostPlus2Slug: true,
    backgroundAbilityBoostPlus1Slug: true,
  })
  .superRefine(refinePointBuy)
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
