"use client";

import type { ClassPanelActionRecord } from "@/entities/combat-mechanical/types";
import { Button } from "@/shared/ui/button";

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
  // Record (ReadonlyMap is rare; callers use Map or plain object)
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
 * Botões de ação de painel a partir do catálogo (`panelActions`).
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
}: CombatPanelActionButtonsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
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

        return (
          <Button
            key={action.panelKey || action.slug}
            type="button"
            size={size}
            variant={resolveVariant(action, variant)}
            title={
              action.title ??
              (action.spendsFocus && focusRemaining != null
                ? `Gasta 1 Ponto de Foco (${focusRemaining})`
                : undefined)
            }
            disabled={
              disabled || isPending || resourceDepleted || focusDepleted
            }
            onClick={() => onAction(action.slug)}
          >
            {action.name}
            {shownRemaining != null ? ` (${shownRemaining})` : ""}
          </Button>
        );
      })}
    </div>
  );
}
