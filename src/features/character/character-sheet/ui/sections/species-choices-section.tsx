"use client";

import { HeritageChoicesSection } from "@/features/character/character-sheet/ui/sections/heritage-choices-section";
import { PhbSpeciesChoicesSection } from "@/features/character/character-sheet/ui/sections/phb-species-choices-section";
import type { SheetReadSectionProps } from "@/features/character/character-sheet/ui/sections/sheet-section-types";

export function SpeciesChoicesSection(props: SheetReadSectionProps) {
  if (props.character.heritageSlug) {
    return <HeritageChoicesSection character={props.character} />;
  }
  return <PhbSpeciesChoicesSection character={props.character} />;
}
