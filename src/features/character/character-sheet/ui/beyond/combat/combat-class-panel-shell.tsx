"use client";

import type { ReactNode } from "react";

import { BookOpenIcon, SparklesIcon } from "@heroicons/react/24/outline";

import { SheetSubheader } from "@/features/character/character-sheet/ui/sheet/sheet-ui";

type CombatClassPanelShellProps = {
  title: string;
  actionsContent: ReactNode;
  powersContent?: ReactNode | null;
  /** Ignorado — passivas vão no topo da aba Ações. */
  combatNotes?: string[];
  actionsIcon?: string;
  powersIcon?: string;
};

/**
 * Conteúdo flat de combate por classe (sem sub-abas).
 * Usado dentro da aba Ações após remoção do hub.
 */
export function CombatClassPanelShell({
  title,
  actionsContent,
  powersContent = null,
}: CombatClassPanelShellProps) {
  const hasActions = actionsContent != null && actionsContent !== false;
  const hasPowers = powersContent != null && powersContent !== false;

  if (!hasActions && !hasPowers) return null;

  return (
    <section
      className="space-y-3 rounded-xl border border-border/50 bg-card/40 p-3"
      aria-label={title}
    >
      <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {title}
      </p>
      {hasActions ? (
        <div className="space-y-1.5">
          <SheetSubheader title="Ferramentas" icon={SparklesIcon} />
          {actionsContent}
        </div>
      ) : null}
      {hasPowers ? (
        <div className="space-y-1.5">
          <SheetSubheader title="Poderes" icon={BookOpenIcon} />
          {powersContent}
        </div>
      ) : null}
    </section>
  );
}
