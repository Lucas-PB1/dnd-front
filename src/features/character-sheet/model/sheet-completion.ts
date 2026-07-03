import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";

function walkValue(value: unknown, counts: { filled: number; total: number }) {
  if (typeof value === "string") {
    counts.total += 1;
    if (value.trim() !== "") {
      counts.filled += 1;
    }
    return;
  }

  if (typeof value === "boolean") {
    counts.total += 1;
    if (value) {
      counts.filled += 1;
    }
    return;
  }

  if (typeof value === "number") {
    counts.total += 1;
    if (value > 0) {
      counts.filled += 1;
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => walkValue(item, counts));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => walkValue(item, counts));
  }
}

export function getCharacterSheetCompletion(sheet: CharacterSheet): number {
  const counts = { filled: 0, total: 0 };
  walkValue(sheet, counts);

  if (counts.total === 0) {
    return 0;
  }

  return Math.round((counts.filled / counts.total) * 100);
}
