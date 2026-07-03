"use client";

import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";
import { MAGIC_ITEM_ROW_COUNT } from "@/entities/character-sheet/constants";
import { Input } from "@/shared/ui/input";
import {
  SheetCheckbox,
  SheetSection,
  SheetTextarea,
} from "@/features/character-sheet/ui/sheet-primitives";

export function StepStory({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SheetSection title="Appearance">
          <SheetTextarea {...register("appearance")} className="min-h-32" />
        </SheetSection>

        <SheetSection title="Backstory & Personality">
          <SheetTextarea {...register("backstory")} className="min-h-32" />
        </SheetSection>
      </div>

      <SheetSection title="Languages">
        <SheetTextarea {...register("languages")} className="min-h-20" />
      </SheetSection>

      <SheetSection title="Magic Item Attunement">
        <div className="flex flex-col gap-3">
          {Array.from({ length: MAGIC_ITEM_ROW_COUNT }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <SheetCheckbox
                label="Attuned"
                checked={watch(`magicItems.${index}.attuned`)}
                onChange={(value) =>
                  setValue(`magicItems.${index}.attuned`, value)
                }
              />
              <Input
                className="h-8 flex-1"
                placeholder="Magic item name"
                {...register(`magicItems.${index}.name`)}
              />
            </div>
          ))}
        </div>
      </SheetSection>
    </div>
  );
}
