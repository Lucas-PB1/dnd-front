import type { BackgroundDefinition } from "@/domain/character-sheet/types/background";

import { PHB_2024_BACKGROUND_DETAILS_PART_ONE } from "./part-one";
import { PHB_2024_BACKGROUND_DETAILS_PART_TWO } from "./part-two";

export const PHB_2024_BACKGROUND_DETAILS: BackgroundDefinition[] = [
  ...PHB_2024_BACKGROUND_DETAILS_PART_ONE,
  ...PHB_2024_BACKGROUND_DETAILS_PART_TWO,
];
