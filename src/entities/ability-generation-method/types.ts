export type AbilityGenerationPointBuy = {
  budget: number;
  minScore: number;
  maxScore: number;
  costByScore: Record<string, number>;
};

export type AbilityGenerationMethod = {
  slug: string;
  name: string;
  description: string;
  pool?: number[] | null;
  pointBuy?: AbilityGenerationPointBuy | null;
  rollTotalMin?: number | null;
  rollTotalMax?: number | null;
  rollOptionCount?: number | null;
};
