import type { DeepPartialSkipArrayKey } from "react-hook-form";

import {
  createEmptyCharacterSheet,
  type CharacterSheet,
} from "@/features/character-sheet/model/character-sheet.schema";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeValues(base: unknown, partial: unknown): unknown {
  if (partial === undefined) {
    return base;
  }

  if (Array.isArray(base) && Array.isArray(partial)) {
    return base.map((item, index) => mergeValues(item, partial[index]));
  }

  if (isPlainObject(base) && isPlainObject(partial)) {
    const merged: Record<string, unknown> = { ...base };

    for (const [key, value] of Object.entries(partial)) {
      merged[key] = mergeValues(base[key], value);
    }

    return merged;
  }

  return partial;
}

export function mergeCharacterSheet(
  partial: DeepPartialSkipArrayKey<CharacterSheet> | undefined,
): CharacterSheet {
  if (!partial) {
    return createEmptyCharacterSheet();
  }

  return mergeValues(createEmptyCharacterSheet(), partial) as CharacterSheet;
}
