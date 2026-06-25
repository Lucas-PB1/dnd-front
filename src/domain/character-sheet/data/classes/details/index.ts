import type { ClassDetail } from "@/domain/character-sheet/types/class";

const SUBCLASS_UNLOCK_LEVEL = 3;

import { PHB_2024_CLASS_DETAILS_PART_ONE } from "./part-one";
import { PHB_2024_CLASS_DETAILS_PART_TWO } from "./part-two";

export const PHB_2024_CLASS_DETAILS: ClassDetail[] = [
  ...PHB_2024_CLASS_DETAILS_PART_ONE,
  ...PHB_2024_CLASS_DETAILS_PART_TWO,
];
