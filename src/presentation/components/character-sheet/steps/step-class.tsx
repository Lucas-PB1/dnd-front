"use client";

import {
  CHARACTER_LEVELS,
  findCharacterClass,
  PHB_2024_CLASSES,
} from "@/domain/character-sheet/classes";
import type { CharacterSheetFormProps } from "@/presentation/components/character-sheet/character-sheet-form-props";
import {
  SheetInput,
  SheetSection,
  SheetSelect,
} from "@/presentation/components/character-sheet/sheet-primitives";

export function StepClass({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  const characterClass = watch("characterClass");
  const characterLevel = watch("characterLevel");
  const subclass = watch("subclass");
  const classDefinition = findCharacterClass(characterClass);

  function handleClassChange(value: string) {
    setValue("characterClass", value);
    setValue("subclass", "");
  }

  return (
    <SheetSection title="Classe & Nível">
      <div className="mx-auto grid max-w-xl gap-4">
        <SheetSelect
          label="Classe"
          value={characterClass}
          onChange={handleClassChange}
          options={PHB_2024_CLASSES.map((definition) => ({
            value: definition.id,
            label: definition.name,
          }))}
          placeholder="Escolha uma classe"
        />

        <SheetSelect
          label="Nível"
          value={characterLevel}
          onChange={(value) => setValue("characterLevel", value)}
          options={CHARACTER_LEVELS.map((level) => ({
            value: level,
            label: `Nível ${level}`,
          }))}
          placeholder="Nível do personagem"
        />

        <SheetSelect
          label={classDefinition?.subclassLabel ?? "Subclasse"}
          value={subclass}
          onChange={(value) => setValue("subclass", value)}
          options={
            classDefinition?.subclasses.map((entry) => ({
              value: entry.id,
              label: entry.name,
            })) ?? []
          }
          placeholder={
            classDefinition
              ? `Escolha ${classDefinition.subclassLabel.toLowerCase()}`
              : "Selecione a classe primeiro"
          }
          disabled={!classDefinition}
        />

        <SheetInput
          label="Experience Points"
          {...register("experiencePoints")}
        />
      </div>
    </SheetSection>
  );
}
