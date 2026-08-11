import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  ARTISAN_TOOL_OPTIONS,
  INSTRUMENT_OPTIONS,
} from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";

const GENERIC_INSTRUMENT_SLUG = "instrumento-musical";

type CatalogOption = {
  value: string;
  label: string;
};

/**
 * Opções de proficiency para o select do talento.
 * Prefer whitelist da API; para instrumentos/artesão, cai no catálogo local
 * se a API vier vazia (seed incompleto).
 */
export function resolveFeatProficiencyOptions(
  def: FeatOptionDefinition,
  catalogProficiencyOptions: CatalogOption[],
): CatalogOption[] {
  const fromApi = (def.values ?? [])
    .filter((item) => item.valueId !== GENERIC_INSTRUMENT_SLUG)
    .map((item) => ({
      value: item.valueId,
      label: item.label,
    }));

  if (fromApi.length > 0) {
    return fromApi;
  }

  if (def.optionKey.startsWith("musicalInstrument")) {
    return INSTRUMENT_OPTIONS.map((item) => ({
      value: item.slug,
      label: item.name,
    }));
  }

  if (def.optionKey.startsWith("artisanTool")) {
    return ARTISAN_TOOL_OPTIONS.map((item) => ({
      value: item.slug,
      label: item.name,
    }));
  }

  return catalogProficiencyOptions;
}
