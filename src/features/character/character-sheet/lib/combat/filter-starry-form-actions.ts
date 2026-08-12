import type { ClassEconomyAction } from "@/features/character/character-sheet/lib/combat/class-action-economy";
import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";

export type StarryFormUiState = {
  starryFormActive: boolean;
  stellarConstellation: string | null;
};

const STARRY_FORM_SLUG_PREFIX = "starry-form-";

export function isStarryFormActionSlug(slug: string): boolean {
  return slug.startsWith(STARRY_FORM_SLUG_PREFIX);
}

function constellationFromStarryFormSlug(slug: string): string | null {
  if (!isStarryFormActionSlug(slug)) return null;
  const suffix = slug.slice(STARRY_FORM_SLUG_PREFIX.length);
  if (suffix === "end") return null;
  return suffix;
}

export function filterStarryFormPanelActions(
  actions: readonly ClassPanelActionRecord[],
  state: StarryFormUiState,
): ClassPanelActionRecord[] {
  return actions
    .filter((action) => {
      if (!isStarryFormActionSlug(action.slug)) return true;
      if (action.slug === "starry-form-end") {
        return state.starryFormActive;
      }
      const constellation = constellationFromStarryFormSlug(action.slug);
      if (!constellation) return true;
      if (!state.starryFormActive) return true;
      return state.stellarConstellation === constellation;
    })
    .map((action) => {
      if (
        state.starryFormActive &&
        state.stellarConstellation &&
        action.slug === `starry-form-${state.stellarConstellation}`
      ) {
        return { ...action, resourceSlug: null };
      }
      return action;
    });
}

export function filterStarryFormEconomyActions(
  actions: readonly ClassEconomyAction[],
  state: StarryFormUiState,
): ClassEconomyAction[] {
  return actions
    .filter((action) => {
      const tableAction = action.tableAction;
      if (!tableAction || !isStarryFormActionSlug(tableAction)) return true;
      if (tableAction === "starry-form-end") {
        return state.starryFormActive;
      }
      const constellation = constellationFromStarryFormSlug(tableAction);
      if (!constellation) return true;
      if (!state.starryFormActive) return true;
      return state.stellarConstellation === constellation;
    })
    .map((action) => {
      const tableAction = action.tableAction;
      if (
        state.starryFormActive &&
        state.stellarConstellation &&
        tableAction === `starry-form-${state.stellarConstellation}`
      ) {
        return {
          ...action,
          resourceSlug: undefined,
          alwaysSpendsResource: false,
        };
      }
      return action;
    });
}

export function stellarConstellationDisplayLabel(
  constellation: string | null,
): string | null {
  switch (constellation) {
    case "archer":
      return "Arqueiro";
    case "chalice":
      return "Taça";
    case "dragon":
      return "Dragão";
    default:
      return null;
  }
}
