import type { PaginatedResponse } from "@/shared/api/dnd-api/types";

/** Espelha ItemResponseDto */
export type ItemSummary = {
  slug: string;
  name: string;
  itemType: string;
  costText: string | null;
  weight: string | null;
  description: string | null;
  properties: Record<string, unknown> | null;
};

export type ItemListResponse = PaginatedResponse<ItemSummary>;

export const ITEM_TYPE_LABELS_PT: Record<string, string> = {
  weapon: "Arma",
  armor: "Armadura",
  tool: "Ferramenta",
  gear: "Equipamento",
  focus: "Foco",
  other: "Outro",
};

/** Tipos da aba “Itens” do compêndio (sem armas/armaduras). */
export const EQUIPMENT_GEAR_ITEM_TYPES = "gear,tool,focus,other";
