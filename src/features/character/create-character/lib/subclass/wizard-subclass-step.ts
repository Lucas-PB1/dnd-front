import { isSubclassRequired } from "@/entities/character/lib/subclass";

export function shouldShowWizardSubclassStep(
  level: number,
  subclassSlug: string,
  optionCount: number,
  optionsLoaded: boolean,
  unlockLevel: number | null | undefined,
): boolean {
  if (!isSubclassRequired(level, unlockLevel) || !subclassSlug.trim()) {
    return false;
  }
  if (!optionsLoaded) return true;
  return optionCount > 0;
}
