import type {
  TemplateAction,
  TemplateSpeed,
  CreatureTemplateTrait,
} from "@/entities/creature-template/types";

import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

export type VehicleTemplateSummary = {
  slug: string;
  name: string;
  editionSlug: string;
  armorClass: number | null;
  hitPoints: number | null;
  crewCapacity: number | null;
  imageUrl: string | null;
};

export type VehicleTemplateDetail = VehicleTemplateSummary & {
  subtitle: string | null;
  damageThreshold: number | null;
  passengerCapacity: number | null;
  cargoCapacityLb: number | null;
  cargoCapacityLabel: string | null;
  initiativeModifier: number | null;
  abilityScores: Record<string, number> | null;
  speeds: TemplateSpeed[];
  actions: TemplateAction[];
  traits: CreatureTemplateTrait[];
};

export type VehicleTemplateListResponse =
  PaginatedResponse<VehicleTemplateSummary>;
