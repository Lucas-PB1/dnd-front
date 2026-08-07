import type {
  ClassPanelActionRecord,
  PanelActionSection,
} from "@/entities/combat-mechanical/types";

export type ResolvePanelActionsInput = {
  classSlug: string;
  level: number;
  subclassSlug?: string | null;
  section?: PanelActionSection;
};

/**
 * Filtra ações de painel do catálogo mecânico por classe / nível / seção.
 */
export function resolvePanelActions(
  catalog: readonly ClassPanelActionRecord[],
  input: ResolvePanelActionsInput,
): ClassPanelActionRecord[] {
  const subclass = input.subclassSlug ?? null;
  return catalog
    .filter((action) => {
      if (action.classSlug !== input.classSlug) return false;
      if (input.level < action.minLevel) return false;
      if (input.section != null && action.section !== input.section) {
        return false;
      }
      if (action.subclassSlug != null && action.subclassSlug !== subclass) {
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
