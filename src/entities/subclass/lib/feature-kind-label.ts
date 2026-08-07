/** Labels PT para `rpg.subclass_feature_kind`. */
const SUBCLASS_FEATURE_KIND_LABELS: Record<string, string> = {
  passive: "Passivo",
  resource: "Recurso",
  choice: "Escolha",
  always_prepared: "Sempre preparada",
  spellcasting: "Conjuração",
  spellbook_bonus: "Bônus de grimório",
  spell: "Magia",
};

export function subclassFeatureKindLabel(
  kind: string | null | undefined,
): string | null {
  if (!kind) return null;
  return SUBCLASS_FEATURE_KIND_LABELS[kind] ?? kind;
}
