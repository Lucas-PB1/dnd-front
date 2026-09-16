export type CompanionTracker = {
  actorId: string;
  name: string;
  templateSlug: string | null;
  hitPointsCurrent: number | null;
  hitPointsMax: number | null;
  armorClass: number | null;
  defeated: boolean;
  conditions: string[];
};
