"use client";

import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import {
  SheetInput,
  SheetSection,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepIdentity({ register }: CharacterSheetFormProps) {
  return (
    <SheetSection title="Identidade">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <SheetInput
          label="Character Name"
          className="text-lg font-semibold"
          placeholder="Nome do herói"
          autoFocus
          {...register("characterName")}
        />
        <SheetInput label="Species" {...register("species")} />
        <SheetInput label="Background" {...register("background")} />
        <SheetInput label="Alignment" {...register("alignment")} />
      </div>
    </SheetSection>
  );
}
