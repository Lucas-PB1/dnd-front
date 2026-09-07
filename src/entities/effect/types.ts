export type CatalogEffectSummary = {
  id: string;
  kind: string;
  trigger: string;
  label: string | null;
  note: string | null;
  unlockLevel: number;
  sortOrder: number;
};
