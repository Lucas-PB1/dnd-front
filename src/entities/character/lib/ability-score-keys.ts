import type { AbilityScores } from "@/entities/character/types";

export const ABILITY_SCORE_KEYS = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
] as const satisfies readonly (keyof AbilityScores)[];
