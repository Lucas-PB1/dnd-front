export type ActorKind = "creature" | "mount" | "vehicle" | "companion";

export type ActorSummary = {
  id: string;
  name: string;
  actorKind: ActorKind;
  parentCharacterId: string | null;
  templateSlug: string | null;
  campaignId: string | null;
  hitPointsCurrent: number | null;
  hitPointsMax: number | null;
  armorClass: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ActorDetail = ActorSummary & {
  initiativeModifier: number | null;
  proficiencyBonus: number | null;
  abilityScores: Record<string, number>;
  sizeSlug: string | null;
  notes: string | null;
  spellcastingAbilitySlug: string | null;
  spellSaveDc: number | null;
  spellAttackBonus: number | null;
  damageThreshold: number | null;
  crewCapacity: number | null;
  passengerCapacity: number | null;
  cargoCapacityLb: number | null;
  imageUrl: string | null;
  speeds: Array<{ movementKind: string; speedFt: number }>;
  actions: Array<{
    id: string;
    name: string;
    actionBucket?: string;
    attackBonus?: number;
    damageExpression?: string;
    reachFt?: number;
    description?: string | null;
    sortOrder?: number;
  }>;
  spells: Array<{
    spellSlug: string;
    usageKind: string;
    usesPerDay?: number;
    slotLevel?: number;
    rechargeDice?: string;
    sortOrder?: number;
  }>;
  state: {
    conditions: string[];
    tempHp: number;
    concentratingOn: string | null;
    innateSpellUses: Record<string, number>;
  } | null;
};

export type SpawnActorFromTemplatePayload = {
  templateSlug: string;
  actorKind: ActorKind;
  parentCharacterId?: string;
  nameOverride?: string;
};

export const ACTOR_KIND_LABELS: Record<ActorKind, string> = {
  creature: "Criatura",
  mount: "Montaria",
  vehicle: "Veículo",
  companion: "Companheiro",
};
