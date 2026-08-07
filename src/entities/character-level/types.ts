/** Espelha CharacterLevelResponseDto — `GET /character-levels`. */
export type CharacterLevel = {
  level: number;
  proficiencyBonus: number;
  xpThreshold?: number | null;
};
