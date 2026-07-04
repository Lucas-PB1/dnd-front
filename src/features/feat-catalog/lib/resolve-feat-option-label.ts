import type { FeatOptionDefinition } from "@/entities/feat/types";

export type FeatOptionLabelContext = {
  resolveSpell: (slug: string) => string;
  resolveSkill: (slug: string) => string;
  resolveItem?: (slug: string) => string;
};

export function resolveFeatOptionValueLabel(
  def: FeatOptionDefinition | undefined,
  valueId: string,
  ctx: FeatOptionLabelContext,
): string {
  if (!def) return valueId;

  if (def.valueType === "catalog") {
    return (
      def.values.find((value) => value.valueId === valueId)?.label ?? valueId
    );
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
