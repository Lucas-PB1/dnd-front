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
  kind?: string | null;
  consumable?: boolean;
  magic?: boolean;
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

export const SHOP_KIND_CHIPS: Array<{
  id: string;
  label: string;
  itemType?: string;
  kind?: string;
  consumable?: boolean;
  magic?: boolean | null;
}> = [
  { id: "all", label: "Todos" },
  { id: "weapon", label: "Armas", itemType: "weapon" },
  { id: "armor", label: "Armaduras", itemType: "armor" },
  { id: "gear", label: "Equipamento", itemType: "gear" },
  { id: "tool", label: "Ferramentas", itemType: "tool" },
  { id: "consumable", label: "Consumíveis", consumable: true },
  {
    id: "transport",
    label: "Transporte",
    kind: "mount,drawn-vehicle,large-vehicle,saddle,mount-feed,barding",
  },
  { id: "service", label: "Serviços", kind: "service" },
  { id: "mundane", label: "Mundano", magic: false },
  { id: "magic", label: "Mágico", magic: true },
];

/** Tipos da aba “Itens” do compêndio (sem armas/armaduras). */
export const EQUIPMENT_GEAR_ITEM_TYPES = "gear,tool,focus,other";
