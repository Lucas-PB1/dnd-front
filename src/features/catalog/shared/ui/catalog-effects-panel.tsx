"use client";

import type { CatalogEffectSummary } from "@/entities/effect/types";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type CatalogEffectsPanelProps = {
  effects: CatalogEffectSummary[] | undefined;
  isPending: boolean;
  isError: boolean;
};

export function CatalogEffectsPanel({
  effects,
  isPending,
  isError,
}: CatalogEffectsPanelProps) {
  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando efeitos…</p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar os efeitos tipados.
      </p>
    );
  }
  if (!effects?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Sem efeitos tipados cadastrados.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {effects.map((effect) => (
        <CollapsibleCard
          key={effect.id}
          title={effect.label ?? effect.kind}
          subtitle={`${effect.kind} · ${effect.trigger}${
            effect.unlockLevel > 1 ? ` · nv. ${effect.unlockLevel}` : ""
          }`}
          defaultOpen={effects.length <= 4}
        >
          {effect.note ? (
            <PhbProse
              text={effect.note}
              className="text-base leading-relaxed text-justify text-foreground/85"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sem nota mecânica.</p>
          )}
        </CollapsibleCard>
      ))}
    </div>
  );
}
