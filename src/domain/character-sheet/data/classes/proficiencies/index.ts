import type { ClassProficienciesDefinition } from "@/domain/character-sheet/types/class";

import { PHB_2024_CLASS_PROFICIENCIES_PART_ONE } from "./part-one";
import { PHB_2024_CLASS_PROFICIENCIES_PART_TWO } from "./part-two";

export const PHB_2024_CLASS_PROFICIENCIES: ClassProficienciesDefinition[] = [
  ...PHB_2024_CLASS_PROFICIENCIES_PART_ONE,
  ...PHB_2024_CLASS_PROFICIENCIES_PART_TWO,
];
