"use client";

import type { SheetReadSectionProps } from "@/features/character-sheet/ui/sections/sheet-section-types";
import { SheetChip } from "@/features/character-sheet/ui/sheet/sheet-ui";

export function LanguagesSection({ character, labels }: SheetReadSectionProps) {
  if (character.languageSlugs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum idioma registrado.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {character.languageSlugs.map((language) => (
        <li key={language}>
          <SheetChip>{labels.resolveLanguage(language)}</SheetChip>
        </li>
      ))}
    </ul>
  );
}
