import type { ReactNode } from "react";
import type { TemplateAction } from "@/entities/creature-template/types";
import { formatTemplateSpeeds } from "@/entities/creature-template/format";
import { formatReachFromFeet } from "@/shared/lib/metric";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type StatBlockSectionProps = {
  title: string;
  children: ReactNode;
};

function StatBlockSection({ title, children }: StatBlockSectionProps) {
  return (
    <CollapsibleCard title={title} defaultOpen>
      <div className="space-y-2 text-sm">{children}</div>
    </CollapsibleCard>
  );
}

export function TemplateActionsList({ actions }: { actions: TemplateAction[] }) {
  if (!actions.length) return null;
  return (
    <StatBlockSection title="Ações">
      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.id}>
            <p className="font-semibold">{action.name}</p>
            <p className="text-muted-foreground">
              {[
                action.actionBucket !== "action" ? action.actionBucket : null,
                action.attackBonus != null
                  ? `+${action.attackBonus} ataque`
                  : null,
                action.damageExpression,
                action.reachFt != null
                  ? formatReachFromFeet(action.reachFt)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </li>
        ))}
      </ul>
    </StatBlockSection>
  );
}

export function TemplateSpeedsLine({
  speeds,
}: {
  speeds: Array<{ movementKind: string; speedFt: number }>;
}) {
  return <span>{formatTemplateSpeeds(speeds)}</span>;
}

export function TemplateTraitsList({
  traits,
}: {
  traits: Array<{ name: string; description: string; sortOrder: number }>;
}) {
  if (!traits.length) return null;
  return (
    <StatBlockSection title="Traços">
      <ul className="space-y-3">
        {traits.map((trait) => (
          <li key={`${trait.name}-${trait.sortOrder}`}>
            <p className="font-semibold">{trait.name}</p>
            <PhbProse text={trait.description} />
          </li>
        ))}
      </ul>
    </StatBlockSection>
  );
}

export function TemplateSpellsList({
  spells,
}: {
  spells: Array<{
    spellSlug: string;
    usageKind: string;
    usesPerDay: number | null;
    slotLevel: number | null;
    rechargeDice: string | null;
  }>;
}) {
  if (!spells.length) return null;
  return (
    <StatBlockSection title="Magias inatas">
      <ul className="space-y-1.5">
        {spells.map((spell) => (
          <li key={`${spell.spellSlug}-${spell.usageKind}-${spell.slotLevel}`}>
            <span className="font-medium">{spell.spellSlug}</span>
            <span className="text-muted-foreground">
              {" "}
              ({spell.usageKind}
              {spell.usesPerDay != null ? ` · ${spell.usesPerDay}/dia` : ""}
              {spell.slotLevel != null ? ` · círculo ${spell.slotLevel}` : ""}
              {spell.rechargeDice ? ` · recarga ${spell.rechargeDice}` : ""})
            </span>
          </li>
        ))}
      </ul>
    </StatBlockSection>
  );
}
