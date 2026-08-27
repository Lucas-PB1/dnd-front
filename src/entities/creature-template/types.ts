export type TemplateSpeed = {
  movementKind: string;
  speedFt: number;
};

export type TemplateAction = {
  id: number;
  name: string;
  actionBucket: string;
  attackBonus: number | null;
  damageExpression: string | null;
  reachFt: number | null;
  description: string | null;
  sortOrder: number;
};

export type CreatureTemplateSummary = {
  slug: string;
  name: string;
  editionSlug: string;
  creatureType: string;
  sizeSlug: string | null;
  challengeRating: string | null;
  armorClass: number | null;
  hitPointsAvg: number | null;
};

export type CreatureTemplateSpell = {
  spellSlug: string;
  usageKind: string;
  usesPerDay: number | null;
  slotLevel: number | null;
  rechargeDice: string | null;
  sortOrder: number;
};

export type CreatureTemplateTrait = {
  name: string;
  description: string;
  sortOrder: number;
};

export type CreatureTemplateDetail = CreatureTemplateSummary & {
  subtitle: string | null;
  alignment: string | null;
  initiativeModifier: number | null;
  abilityScores: Record<string, number> | null;
  creatureSubtype: string | null;
  proficiencyBonus: number | null;
  hitPointsFormula: string | null;
  spellcastingAbilitySlug: string | null;
  spellSaveDc: number | null;
  spellAttackBonus: number | null;
  speeds: TemplateSpeed[];
  actions: TemplateAction[];
  spells: CreatureTemplateSpell[];
  traits: CreatureTemplateTrait[];
};

export type CreatureTemplateListResponse = {
  data: CreatureTemplateSummary[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  };
};
