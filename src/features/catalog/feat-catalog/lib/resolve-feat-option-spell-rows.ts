import type { ClassSpellOption } from "@/entities/class/types";
import type { FeatOptionDefinition } from "@/entities/feat/types";
import type { SpellCatalogLabel } from "@/entities/spell/types";

type SpellRowSource = {
  def: FeatOptionDefinition;
  allSpells: SpellCatalogLabel[];
  classSpellsLevel0: ClassSpellOption[];
  classSpellsLevel1: ClassSpellOption[];
};

type SpellLoadingSource = {
  def: FeatOptionDefinition;
  allSpellsPending: boolean;
  classSpellsLevel0Pending: boolean;
  classSpellsLevel1Pending: boolean;
};

/** Magia de círculo aberto (qualquer lista) — ex.: Bênção de Wotan. */
export function isOpenSpellFeatOption(def: FeatOptionDefinition): boolean {
  return (
    def.valueType === "spell" &&
    !def.dependsOnOptionKey &&
    !def.spellRitualOnly &&
    !(def.spellSchoolSlugs?.length)
  );
}

export function resolveFeatOptionSpellRows({
  def,
  allSpells,
  classSpellsLevel0,
  classSpellsLevel1,
}: SpellRowSource): ClassSpellOption[] | SpellCatalogLabel[] {
  if (def.spellRitualOnly) {
    return allSpells.filter(
      (spell) =>
        spell.level === (def.spellMaxLevel ?? 1) && spell.ritual,
    );
  }
  if (def.spellSchoolSlugs?.length) {
    if (def.spellMaxLevel === null) {
      return allSpells.filter(
        (spell) =>
          spell.level >= 1 &&
          def.spellSchoolSlugs?.includes(spell.schoolSlug),
      );
    }
    return allSpells.filter(
      (spell) =>
        spell.level === (def.spellMaxLevel ?? 1) &&
        def.spellSchoolSlugs?.includes(spell.schoolSlug),
    );
  }
  if (isOpenSpellFeatOption(def)) {
    const exactLevel = def.spellMaxLevel ?? 1;
    return allSpells.filter((spell) => spell.level === exactLevel);
  }
  const exactLevel = def.spellMaxLevel ?? 1;
  // `GET /classes/:slug/spells?maxLevel=` filtra com `<=`; aqui precisamos do círculo exato
  // (ex.: Magia de 1º círculo do Iniciado em Magia não pode listar truques).
  if (exactLevel === 0) {
    return classSpellsLevel0.filter((spell) => spell.level === 0);
  }
  return classSpellsLevel1.filter((spell) => spell.level === exactLevel);
}

export function resolveFeatOptionSpellLoading({
  def,
  allSpellsPending,
  classSpellsLevel0Pending,
  classSpellsLevel1Pending,
}: SpellLoadingSource): boolean {
  if (
    def.spellRitualOnly ||
    def.spellSchoolSlugs?.length ||
    isOpenSpellFeatOption(def)
  ) {
    return allSpellsPending;
  }
  if (def.spellMaxLevel === 0) {
    return classSpellsLevel0Pending;
  }
  return classSpellsLevel1Pending;
}
