import type { FeatOptionDefinition } from "@/entities/feat/types";
import {
  toolOptionsForPool,
  type ToolPoolsCatalog,
} from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";

const GENERIC_INSTRUMENT_SLUG = "instrumento-musical";

type CatalogOption = {
  value: string;
  label: string;
};

export function resolveFeatProficiencyOptions(
  def: FeatOptionDefinition,
  catalogProficiencyOptions: CatalogOption[],
  toolCatalog?: ToolPoolsCatalog,
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
    return toolOptionsForPool("instrument", toolCatalog).map((item) => ({
      value: item.slug,
      label: item.name,
    }));
  }

  if (def.optionKey.startsWith("artisanTool")) {
    return toolOptionsForPool("artisan", toolCatalog).map((item) => ({
      value: item.slug,
      label: item.name,
    }));
  }

  return catalogProficiencyOptions;
}
