import {
  PHB_2024_CLASSES,
  CHARACTER_LEVELS,
  type CharacterClassDefinition,
  type CharacterClassId,
  type CharacterSubclass,
} from "@/domain/character-sheet/data/classes/definitions";

export function findCharacterClass(
  classId: string,
): CharacterClassDefinition | undefined {
  return PHB_2024_CLASSES.find(
    (characterClass) => characterClass.id === classId,
  );
}

export function formatCharacterClassLevel(
  characterClass: string,
  characterLevel: string,
): string {
  const definition = findCharacterClass(characterClass);
  const className = definition?.name ?? characterClass;
  const level = characterLevel.trim();

  if (!className) {
    return "";
  }

  return level ? `${className} ${level}` : className;
}

export function findSubclassName(
  characterClass: string,
  subclassId: string,
): string {
  const definition = findCharacterClass(characterClass);
  return (
    definition?.subclasses.find((subclass) => subclass.id === subclassId)
      ?.name ?? subclassId
  );
}

export {
  PHB_2024_CLASSES,
  CHARACTER_LEVELS,
  type CharacterClassDefinition,
  type CharacterClassId,
  type CharacterSubclass,
};
