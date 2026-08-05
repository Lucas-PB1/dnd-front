"use client";

import type { ReactNode } from "react";

import { CombatClassSubtabs } from "@/features/character/character-sheet/ui/beyond/combat/combat-class-subtabs";
import { CombatNotesList } from "@/features/character/character-sheet/ui/beyond/combat/combat-notes-list";

type CombatClassPanelShellProps = {
  title: string;
  actionsContent: ReactNode;
  powersContent?: ReactNode | null;
  combatNotes?: string[];
  actionsIcon?: string;
  powersIcon?: string;
};

/**
 * Envelope visual único dos painéis de combate por classe:
 * Ações / Poderes / Passivas (notas de mesa).
 */
export function CombatClassPanelShell({
  title,
  actionsContent,
  powersContent = null,
  combatNotes,
  actionsIcon = "⚡",
  powersIcon = "✨",
}: CombatClassPanelShellProps) {
  const passivesContent =
    combatNotes && combatNotes.length > 0 ? (
      <CombatNotesList notes={combatNotes} />
    ) : null;

  return (
    <CombatClassSubtabs
      title={title}
      tabs={[
        {
          id: "actions",
          label: "Ações",
          icon: actionsIcon,
          content: actionsContent,
        },
        {
          id: "powers",
          label: "Poderes",
          icon: powersIcon,
          content: powersContent,
        },
        {
          id: "passives",
          label: "Passivas",
          icon: "📜",
          content: passivesContent,
        },
      ]}
    />
  );
}
