"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import {
  SheetSection,
  SheetTextarea,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepFeatures({ register }: CharacterSheetFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Species Traits">
        <SheetTextarea {...register("speciesTraits")} className="min-h-24" />
      </SheetSection>

      <SheetSection title="Class Features">
        <SheetTextarea {...register("classFeatures")} className="min-h-32" />
      </SheetSection>

      <SheetSection title="Feats">
        <SheetTextarea {...register("feats")} className="min-h-24" />
      </SheetSection>

      <SheetSection title="Cantrips">
        <SheetTextarea {...register("cantrips")} className="min-h-20" />
      </SheetSection>
    </div>
  );
}
