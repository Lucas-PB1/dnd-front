"use client";

import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";
import {
  SheetSection,
  SheetTextarea,
} from "@/features/character-sheet/ui/sheet-primitives";

export function StepFeatures({ register, watch }: CharacterSheetFormProps) {
  const speciesTraits = watch("speciesTraits");

  return (
    <div className="flex flex-col gap-4">
      <SheetSection title="Traços da espécie">
        <p className="mb-3 text-sm text-muted-foreground">
          Preenchidos automaticamente na etapa Identidade. Escolhas de perícia e
          talento aparecem no texto abaixo.
        </p>
        <textarea
          className="min-h-32 w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm outline-none"
          readOnly
          value={speciesTraits}
        />
      </SheetSection>

      <SheetSection title="Talentos de classe">
        <SheetTextarea {...register("classFeatures")} className="min-h-32" />
      </SheetSection>

      <SheetSection title="Talentos">
        <SheetTextarea {...register("feats")} className="min-h-24" />
      </SheetSection>

      <SheetSection title="Truques">
        <SheetTextarea {...register("cantrips")} className="min-h-20" />
      </SheetSection>
    </div>
  );
}
