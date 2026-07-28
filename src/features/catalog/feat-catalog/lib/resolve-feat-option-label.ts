import type { FeatOptionDefinition } from "@/entities/feat/types";

export type FeatOptionLabelContext = {
  resolveSpell: (slug: string) => string;
  resolveSkill: (slug: string) => string;
  resolveItem?: (slug: string) => string;
  resolveAbility?: (slug: string) => string;
  resolveFeat?: (slug: string) => string;
};

function labelFromDefValues(
  def: FeatOptionDefinition | undefined,
  valueId: string,
): string | null {
  if (!def?.values.length) return null;
  return def.values.find((value) => value.valueId === valueId)?.label ?? null;
}

export function resolveFeatOptionValueLabel(
  def: FeatOptionDefinition | undefined,
  valueId: string,
  ctx: FeatOptionLabelContext,
): string {
  if (!def) return valueId;

  const fromValues = labelFromDefValues(def, valueId);
  if (fromValues) return fromValues;

  if (def.valueType === "catalog") {
    return valueId;
  }
  if (def.valueType === "ability") {
    return ctx.resolveAbility?.(valueId) ?? valueId;
  }
  if (def.valueType === "fighting_style") {
    return ctx.resolveFeat?.(valueId) ?? valueId;
  }
  if (def.valueType === "spell") {
    return ctx.resolveSpell(valueId);
  }
  if (def.valueType === "proficiency") {
    return ctx.resolveSkill(valueId) ?? ctx.resolveItem?.(valueId) ?? valueId;
  }

  return valueId;
}

export function resolveFeatOptionDisplay(
  defs: FeatOptionDefinition[],
  optionKey: string,
  valueId: string,
  ctx: FeatOptionLabelContext,
): { label: string; value: string } {
  const def = defs.find((item) => item.optionKey === optionKey);
  return {
    label: def?.label ?? optionKey,
    value: resolveFeatOptionValueLabel(def, valueId, ctx),
  };
}
