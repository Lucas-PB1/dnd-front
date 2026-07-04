import { isSubclassRequired } from "@/entities/character/lib/subclass";

export function shouldShowWizardSubclassStep(
  level: number,
  subclassSlug: string,
  optionCount: number,
  optionsLoaded: boolean,
): boolean {
  if (!isSubclassRequired(level) || !subclassSlug.trim()) return false;
  if (!optionsLoaded) return true;
  return optionCount > 0;
}
