import type {
  CharacterFeat,
  FeatOption,
} from "@/entities/character/sheet-types";
import { featInstanceKey } from "@/entities/character/lib/character-feat";
import { fetchFeatOptions } from "@/features/catalog/feat-catalog/api/feats.api";
import { fetchCharacterLevels } from "@/features/catalog/reference-catalog/api/reference.api";
import { requiredFeatOptionDefsForInstance } from "@/features/character/create-character/lib/feats/feat-option-requirements";
import { proficiencyBonusForLevel } from "@/features/character/create-character/lib/progression/proficiency-bonus-for-level";

export type IncompleteFeatOptionGap = {
  featSlug: string;
  instanceIndex: number;
  featName: string;
  missingKeys: string[];
  missingLabels: string[];
};

const OPTION_KEY_LABELS_PT: Record<string, string> = {
  abilityIncrease: "Aumento de atributo",
  castingAbility: "Atributo de conjuração",
  cantrip1: "Truque 1",
  cantrip2: "Truque 2",
  bonusSpell: "Magia bônus",
  firstLevelSpell: "Magia de 1º círculo",
  distributionMode: "Modo de distribuição",
  primaryAbility: "Atributo principal",
  secondaryAbility: "Atributo secundário",
};

export function featOptionKeyLabel(optionKey: string): string {
  return OPTION_KEY_LABELS_PT[optionKey] ?? optionKey;
}

/** Lacunas de escolhas internas em talentos já na ficha (ex.: talentos seedados depois). */
export async function listIncompleteFeatOptionGaps(
  characterFeats: CharacterFeat[],
  featOptions: FeatOption[],
  featNameBySlug: Record<string, string> = {},
  characterLevel = 1,
): Promise<IncompleteFeatOptionGap[]> {
  const levelsResponse = await fetchCharacterLevels();
  const catalog = levelsResponse.data ?? [];
  const proficiencyBonus = proficiencyBonusForLevel(characterLevel, catalog);
  const gaps: IncompleteFeatOptionGap[] = [];

  for (const feat of characterFeats) {
    const response = await fetchFeatOptions(feat.featSlug);
    const defs = response.data ?? [];
    if (defs.length === 0) continue;

    const instanceOpts = featOptions.filter(
      (option) =>
        option.featSlug === feat.featSlug &&
        option.instanceIndex === feat.instanceIndex,
    );

    const applicable = requiredFeatOptionDefsForInstance(
      feat.featSlug,
      defs,
      proficiencyBonus,
      instanceOpts,
    );

    const provided = new Set(instanceOpts.map((option) => option.optionKey));
    const missing = applicable.filter((def) => !provided.has(def.optionKey));
    if (missing.length === 0) continue;

    const missingKeys = missing.map((def) => def.optionKey);
    gaps.push({
      featSlug: feat.featSlug,
      instanceIndex: feat.instanceIndex,
      featName: featNameBySlug[feat.featSlug] ?? feat.featSlug,
      missingKeys,
      missingLabels: missingKeys.map(
        (key) =>
          missing.find((def) => def.optionKey === key)?.label?.trim() ||
          featOptionKeyLabel(key),
      ),
    });
  }

  return gaps;
}

export async function findIncompleteCreateFeatOptions(
  characterFeats: CharacterFeat[],
  featOptions: FeatOption[],
  featNameBySlug: Record<string, string> = {},
  characterLevel = 1,
): Promise<string | null> {
  const gaps = await listIncompleteFeatOptionGaps(
    characterFeats,
    featOptions,
    featNameBySlug,
    characterLevel,
  );
  if (gaps.length > 0) {
    const first = gaps[0];
    return `Complete todas as escolhas do talento ${first.featName}.`;
  }

  const validKeys = new Set(
    characterFeats.map((feat) =>
      featInstanceKey(feat.featSlug, feat.instanceIndex),
    ),
  );
  const orphan = featOptions.some(
    (option) =>
      !validKeys.has(featInstanceKey(option.featSlug, option.instanceIndex)),
  );
  if (orphan) {
    return "Há opções de talento inválidas — revise as escolhas.";
  }

  return null;
}
