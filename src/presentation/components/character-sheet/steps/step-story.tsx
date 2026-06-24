"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import { MAGIC_ITEM_ROW_COUNT } from "@/domain/character-sheet/constants";
import { Input } from "@/components/ui/input";
import {
  SheetCheckbox,
  SheetSection,
  SheetTextarea,
} from "@/presentation/components/character-sheet/sheet-primitives";

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
