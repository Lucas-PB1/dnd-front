/** Catálogo mecânico de combate — espelha `GET /combat-mechanical-catalog`. */

export type CunningStrikeEffect = {
  slug: string;
  name: string;
  cost: number;
  unlockLevel: number;
  saveAbility?: string;
  subclassSlug?: string;
  note: string;
};

export type PersonaMask = {
  slug: string;
  name: string;
};

export type PrecautionSpell = {
  slug: string;
  name: string;
};

export type GunslingerManeuverCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  effectKind: string;
  riskCost: number;
  fromLevel: number;
  subclassSlug?: string;
};

export type BattleMasterManeuverCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  timing: string;
  addsToDamage: boolean;
  addsToAttack: boolean;
};

export type SubclassTableActionCatalogEntry = {
  subclassSlug: string;
  slug: string;
  name: string;
  unlockLevel: number;
  freeResourceSlug?: string;
  alwaysSpendsPool: boolean;
  rollsPoolDie: boolean;
  spendsOnlyOnSuccess: boolean;
  alwaysPoolCost?: number;
  repeatPoolCost?: number;
};

export type BeastborneAspectBenefit = {
  level: number;
  note: string;
};

export type ActionEconomyBucket =
  | "action"
  | "bonus"
  | "reaction"
  | "free";

/** Registro da API — features com economia de ação (aba Ações). */
export type ClassEconomyActionRecord = {
  id: string;
  name: string;
  economy: ActionEconomyBucket | string;
  classSlug?: string | null;
  minLevel: number;
  subclassSlug?: string;
  speciesSlug?: string | null;
  featSlug?: string | null;
  itemSlug?: string | null;
  requiresOptionKey?: string;
  requiresOptionValue?: string;
  resourceSlug?: string;
  freeResourceSlug?: string;
  alwaysSpendsResource?: boolean;
  summary?: string;
  description?: string;
  tableAction?: string;
  spendAmount?: number;
};

export type PanelActionSection =
  | "base"
  | "subclass"
  | "metamagic"
  | "channel";

/** Registro da API — botões dos painéis de combate por classe. */
export type ClassPanelActionRecord = {
  panelKey: string;
  classSlug: string;
  subclassSlug?: string;
  slug: string;
  name: string;
  title?: string;
  minLevel: number;
  resourceSlug?: string;
  section: PanelActionSection | string;
  spendsFocus: boolean;
  sortOrder: number;
};

export type CombatMechanicalCatalog = {
  gunslingerManeuvers: GunslingerManeuverCatalogEntry[];
  battleMasterManeuvers: BattleMasterManeuverCatalogEntry[];
  cunningStrikeEffects: CunningStrikeEffect[];
  tableActions: SubclassTableActionCatalogEntry[];
  personaMasks: PersonaMask[];
  beastborneAspectBenefits: BeastborneAspectBenefit[];
  dungeoneerSlayerLabels: string[];
  precautionSpells: PrecautionSpell[];
  economyActions: ClassEconomyActionRecord[];
  panelActions: ClassPanelActionRecord[];
};
