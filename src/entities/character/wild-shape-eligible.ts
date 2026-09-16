export type WildShapeEligibleBeast = {
  slug: string;
  name: string;
  challengeRating: string | null;
  armorClass: number | null;
  hasFlySpeed: boolean;
  known: boolean;
};

export type WildShapeEligibleList = {
  maxKnownForms: number;
  knownSlugs: string[];
  formSwapAvailable: boolean;
  beasts: WildShapeEligibleBeast[];
};
