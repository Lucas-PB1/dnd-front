"use client";

import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import {
  CombatPanelActionList,
  CombatPanelActionRow,
} from "./panel-action-row";

type ButtonSize = "xs" | "sm";
type ButtonVariant = "outline" | "ghost" | "secondary" | "default";

export type CombatPanelActionButtonsProps = {
  actions: readonly ClassPanelActionRecord[];
  /** Remaining for a resource slug; also used for focusPoints when spendsFocus. */
  getRemaining?: (slug: string) => number | null | undefined;
  remainingByResourceSlug?: ReadonlyMap<string, number> | Record<string, number>;
  isPending: boolean;
  onAction: (slug: string) => void;
  /** Extra disable (e.g. channel pool empty when resourceSlug is absent). */
  disabled?: boolean;
  size?: ButtonSize;
  /** Override variant for all buttons; otherwise derived from resource/focus. */
  variant?: ButtonVariant;
  /** Append this remaining to every label (paladin channel, etc.). */
  displayRemaining?: number | null;
  /** When false, never append remaining to the label (still used for disable). */
  showRemaining?: boolean;
  focusResourceSlug?: string;
  /** Cabeçalho da lista colapsável. */
  listTitle?: string;
  listDefaultOpen?: boolean;
};

function lookupRemaining(
  slug: string,
  getRemaining?: (slug: string) => number | null | undefined,
  remainingByResourceSlug?: ReadonlyMap<string, number> | Record<string, number>,
): number | null {
  if (getRemaining) {
    const value = getRemaining(slug);
    return value == null ? null : value;
  }
  if (!remainingByResourceSlug) return null;
  if (remainingByResourceSlug instanceof Map) {
    return remainingByResourceSlug.get(slug) ?? null;
  }
  const value = (remainingByResourceSlug as Record<string, number>)[slug];
  return value == null ? null : value;
}

function resolveVariant(
  action: ClassPanelActionRecord,
  override?: ButtonVariant,
): ButtonVariant {
  if (override) return override;
  if (action.resourceSlug || action.spendsFocus) return "outline";
  return "ghost";
}

/**
 * Ações de painel a partir do catálogo (`panelActions`).
 * Lista colapsável (bloco inteiro): ao abrir, cada linha mostra nome + descrição + Usar.
 */
export function CombatPanelActionButtons({
  actions,
  getRemaining,
  remainingByResourceSlug,
  isPending,
  onAction,
  disabled = false,
  size = "sm",
  variant,
  displayRemaining = null,
  showRemaining = true,
  focusResourceSlug = "focusPoints",
  listTitle = "Ações",
  listDefaultOpen = false,
}: CombatPanelActionButtonsProps) {
  if (actions.length === 0) return null;

  return (
    <CombatPanelActionList
      title={listTitle}
      count={actions.length}
      defaultOpen={listDefaultOpen}
    >
      {actions.map((action) => {
        const focusRemaining = action.spendsFocus
          ? lookupRemaining(
              focusResourceSlug,
              getRemaining,
              remainingByResourceSlug,
            )
          : null;
        const resourceRemaining = action.resourceSlug
          ? lookupRemaining(
              action.resourceSlug,
              getRemaining,
              remainingByResourceSlug,
            )
          : null;

        const shownRemaining = !showRemaining
          ? null
          : displayRemaining != null
            ? displayRemaining
            : action.spendsFocus
              ? focusRemaining
              : resourceRemaining;

        const resourceDepleted =
          action.resourceSlug != null &&
          resourceRemaining != null &&
          resourceRemaining <= 0;
        const focusDepleted =
          action.spendsFocus &&
          focusRemaining != null &&
          focusRemaining <= 0;

        const description =
          action.title?.trim() ||
          (action.spendsFocus && focusRemaining != null
            ? `Gasta 1 Ponto de Foco (${focusRemaining} restantes).`
            : null);

        return (
          <CombatPanelActionRow
            key={action.panelKey || action.slug}
            name={
              shownRemaining != null
                ? `${action.name} (${shownRemaining})`
                : action.name
            }
            description={description}
            size={size}
            variant={resolveVariant(action, variant)}
            disabled={disabled || resourceDepleted || focusDepleted}
            pending={isPending}
            onAction={() => onAction(action.slug)}
          />
        );
      })}
    </CombatPanelActionList>
  );
}
