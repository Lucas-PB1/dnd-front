import {
  findCharacterClass,
  type CharacterClassDefinition,
} from "@/domain/character-sheet/rules/classes";
import { PHB_2024_CLASS_DETAILS } from "@/domain/character-sheet/data/classes/details/index";
import type {
  ClassDetail,
  SubclassDetail,
} from "@/domain/character-sheet/types/class";

/** PHB 2024 — subclasses adquiridas no nível 3 (Cap. 3) */
export const SUBCLASS_UNLOCK_LEVEL = 3;

export function findClassDetails(classId: string): ClassDetail | undefined {
  return PHB_2024_CLASS_DETAILS.find((entry) => entry.id === classId);
}

export function findSubclassDetail(
  classId: string,
  subclassId: string,
): SubclassDetail | undefined {
  return findClassDetails(classId)?.subclasses.find(
    (entry) => entry.id === subclassId,
  );
}

export function isSubclassUnlocked(characterLevel: string): boolean {
  const level = Number.parseInt(characterLevel, 10);
  return Number.isFinite(level) && level >= SUBCLASS_UNLOCK_LEVEL;
}

export function formatSubclassChoiceLabel(
  classId: string,
  subclassId: string,
): string {
  const classDefinition = findCharacterClass(classId);
  const subclassDefinition = findSubclassDetail(classId, subclassId);

  if (!classDefinition || !subclassDefinition) {
    return subclassId;
  }

  const subclassName = classDefinition.subclasses.find(
    (entry) => entry.id === subclassId,
  )?.name;

  return subclassName ?? subclassId;
}

export type { CharacterClassDefinition };
