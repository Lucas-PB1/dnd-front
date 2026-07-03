"use client";

import {
  CHARACTER_LEVELS,
  findCharacterClass,
  PHB_2024_CLASSES,
} from "@/entities/character-sheet/classes";
import {
  findClassDetails,
  isSubclassUnlocked,
  SUBCLASS_UNLOCK_LEVEL,
} from "@/entities/character-sheet/class-details";
import type { CharacterSheetFormProps } from "@/features/character-sheet/ui/character-sheet-form-props";
import {
  ClassHeritagePanel,
  ClassMetaStrip,
} from "@/features/character-sheet/ui/class-heritage-panel";
import {
  SheetInput,
  SheetSection,
  SheetSelect,
} from "@/features/character-sheet/ui/sheet-primitives";

export function StepClass({
  register,
  watch,
  setValue,
}: CharacterSheetFormProps) {
  const characterClass = watch("characterClass");
  const characterLevel = watch("characterLevel");
  const subclass = watch("subclass");
  const classDefinition = findCharacterClass(characterClass);
  const classDetails = characterClass
    ? findClassDetails(characterClass)
    : undefined;
  const subclassUnlocked = isSubclassUnlocked(characterLevel);

  function handleClassChange(value: string) {
    setValue("characterClass", value);
    setValue("subclass", "");
  }

  function handleLevelChange(value: string) {
    setValue("characterLevel", value);

    if (!isSubclassUnlocked(value)) {
      setValue("subclass", "");
    }
  }

  return (
    <SheetSection title="Classe & Nível">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
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

          {classDetails ? <ClassMetaStrip classDetails={classDetails} /> : null}

          <SheetSelect
            label="Nível"
            value={characterLevel}
            onChange={handleLevelChange}
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
              !classDefinition
                ? "Selecione a classe primeiro"
                : !subclassUnlocked
                  ? `Disponível no nível ${SUBCLASS_UNLOCK_LEVEL}`
                  : `Escolha ${classDefinition.subclassLabel.toLowerCase()}`
            }
            disabled={!classDefinition || !subclassUnlocked}
          />

          {!subclassUnlocked && classDefinition ? (
            <p className="text-xs text-muted-foreground">
              No PHB 2024, você adquire uma{" "}
              {classDefinition.subclassLabel.toLowerCase()} no nível{" "}
              {SUBCLASS_UNLOCK_LEVEL}. Avance o nível para escolher.
            </p>
          ) : null}

          <SheetInput
            label="Pontos de experiência"
            {...register("experiencePoints")}
          />
        </div>

        {classDetails && classDefinition ? (
          <ClassHeritagePanel
            classDetails={classDetails}
            className={classDefinition.name}
            subclassId={subclass || undefined}
            subclassUnlocked={subclassUnlocked}
          />
        ) : null}
      </div>
    </SheetSection>
  );
}
