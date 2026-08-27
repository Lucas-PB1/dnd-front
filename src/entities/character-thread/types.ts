export type CharacterThreadRank =
  | "least"
  | "lesser"
  | "greater"
  | "superior";

export type CharacterThreadGoal = {
  sortOrder: number;
  text: string;
};

export type CharacterThreadBenefit = {
  benefitKey: string;
  name: string;
  description: string;
  choiceGroup: string | null;
  sortOrder: number;
};

export type CharacterThreadMilestone = {
  id: number;
  rank: CharacterThreadRank | string;
  sortOrder: number;
  benefits: CharacterThreadBenefit[];
};

export type CharacterThreadSummary = {
  slug: string;
  name: string;
  editionSlug: string;
  summary: string;
  sortOrder: number;
};

export type CharacterThreadDetail = CharacterThreadSummary & {
  specialRulesText: string | null;
  goals: CharacterThreadGoal[];
  milestones: CharacterThreadMilestone[];
};

export type CharacterThreadMilestoneState = {
  rank: CharacterThreadRank | string;
  benefitKey: string;
  benefitName: string | null;
  benefitDescription: string | null;
  reachedAt: string;
};

export type CharacterThreadState = {
  id: string;
  threadSlug: string;
  threadName: string | null;
  status: "active" | "completed" | "abandoned";
  goalIndex: number | null;
  goalText: string | null;
  startedAt: string;
  endedAt: string | null;
  milestones: CharacterThreadMilestoneState[];
};

export type CharacterThreadBundle = {
  active: CharacterThreadState | null;
  history: CharacterThreadState[];
};

export type CharacterThreadListResponse = {
  data: CharacterThreadSummary[];
  meta: { nextCursor: string | null; hasMore: boolean };
};
