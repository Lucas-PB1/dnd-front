import {
  buildCatalogFilterField,
  catalogFilterOptionsFromNamed,
  type CatalogNamedOption,
} from "@/shared/lib/build-catalog-filter-field";
import type { CatalogFilterField } from "@/shared/ui/catalog-filters";

export function buildSpellLevelFilter(): CatalogFilterField {
  return buildCatalogFilterField("level", "Círculo", [
    { value: "0", label: "Truque" },
    { value: "1", label: "1º" },
    { value: "2", label: "2º" },
    { value: "3", label: "3º" },
    { value: "4", label: "4º" },
    { value: "5", label: "5º" },
    { value: "6", label: "6º" },
    { value: "7", label: "7º" },
    { value: "8", label: "8º" },
    { value: "9", label: "9º" },
  ]);
}

export function buildSpellSchoolFilter(
  schools: readonly CatalogNamedOption[] = [],
): CatalogFilterField {
  return buildCatalogFilterField(
    "school",
    "Escola",
    catalogFilterOptionsFromNamed(schools),
  );
}

export function buildSpellRitualFilter(): CatalogFilterField {
  return buildCatalogFilterField("ritual", "Ritual", [
    { value: "true", label: "Sim" },
    { value: "false", label: "Não" },
  ]);
}

export function buildSpellConcentrationFilter(): CatalogFilterField {
  return buildCatalogFilterField("concentration", "Concentração", [
    { value: "true", label: "Sim" },
    { value: "false", label: "Não" },
  ]);
}

export function buildSpellRollFilter(): CatalogFilterField {
  return buildCatalogFilterField("roll", "Jogada", [
    { value: "attack", label: "Ataque" },
    { value: "save", label: "Salvaguarda" },
  ]);
}

export function buildSpellCastingTimeFilter(): CatalogFilterField {
  return buildCatalogFilterField("castingTime", "Conjuração", [
    { value: "action", label: "Ação" },
    { value: "bonus", label: "Ação bônus" },
    { value: "reaction", label: "Reação" },
    { value: "minute", label: "Minutos" },
    { value: "hour", label: "Horas" },
  ]);
}

export function buildSpellSaveAbilityFilter(): CatalogFilterField {
  return buildCatalogFilterField("saveAbility", "Teste", [
    { value: "forca", label: "Força" },
    { value: "destreza", label: "Destreza" },
    { value: "constituicao", label: "Constituição" },
    { value: "inteligencia", label: "Inteligência" },
    { value: "sabedoria", label: "Sabedoria" },
    { value: "carisma", label: "Carisma" },
  ]);
}

export function buildSpellRangeKindFilter(): CatalogFilterField {
  return buildCatalogFilterField("rangeKind", "Alcance", [
    { value: "self", label: "Pessoal" },
    { value: "touch", label: "Toque" },
    { value: "short", label: "Curto (≤ 9 m)" },
    { value: "medium", label: "Médio (≈ 18–36 m)" },
    { value: "long", label: "Longo" },
  ]);
}

export function spellCatalogFilterFields(
  schools?: readonly CatalogNamedOption[],
): CatalogFilterField[] {
  return [
    buildSpellLevelFilter(),
    buildSpellSchoolFilter(schools),
    buildSpellRitualFilter(),
    buildSpellConcentrationFilter(),
    buildSpellRollFilter(),
    buildSpellCastingTimeFilter(),
    buildSpellSaveAbilityFilter(),
    buildSpellRangeKindFilter(),
  ];
}
