import type { FeatOptionDefinition } from "@/entities/feat/types";
import type { FeatOption } from "@/entities/character/sheet-types";

const RITUAL_CASTER_SLUG = "ritual-caster";
const RITUAL_SPELL_KEY = /^ritualSpell(\d+)$/;
const ASI_FEAT_SLUG = "ability-score-improvement";

export function requiredFeatOptionDefsForInstance(
  featSlug: string,
  defs: FeatOptionDefinition[],
  proficiencyBonus: number,
  instanceOptions: FeatOption[] = [],
): FeatOptionDefinition[] {
  let filtered = defs;
  if (featSlug === RITUAL_CASTER_SLUG) {
    filtered = defs.filter((def) => {
      const match = RITUAL_SPELL_KEY.exec(def.optionKey);
      if (!match) return true;
      return Number.parseInt(match[1], 10) <= proficiencyBonus;
    });
  }
  if (featSlug === ASI_FEAT_SLUG) {
    const mode = instanceOptions.find(
      (o) => o.optionKey === "distributionMode",
    )?.valueId;
    filtered = filtered.filter((def) => {
      if (def.optionKey === "secondaryAbility") {
        return mode === "plus1plus1";
      }
      return true;
    });
  }
  return filtered;
}

export function ritualSpellSlotIndex(optionKey: string): number | null {
  const match = RITUAL_SPELL_KEY.exec(optionKey);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}
