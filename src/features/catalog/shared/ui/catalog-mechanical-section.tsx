"use client";

import type {
  ClassEconomyActionRecord,
  ClassPanelActionRecord,
} from "@/entities/combat-mechanical/types";
import { economyBucketLabel } from "@/entities/combat-mechanical/lib/economy-bucket-label";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type Props = {
  economyActions: ClassEconomyActionRecord[];
  panelActions?: ClassPanelActionRecord[];
  isPending: boolean;
  isError: boolean;
};

function groupByLevel(actions: ClassEconomyActionRecord[]) {
  const map = new Map<number, ClassEconomyActionRecord[]>();
  for (const action of actions) {
    const list = map.get(action.minLevel) ?? [];
    list.push(action);
    map.set(action.minLevel, list);
  }
  return [...map.entries()].sort(([left], [right]) => left - right);
}

export function CatalogMechanicalSection({
  economyActions,
  panelActions = [],
  isPending,
  isError,
}: Props) {
  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando ações de mesa…</p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar as ações de mesa.
      </p>
    );
  }
  if (economyActions.length === 0 && panelActions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="catalog-mechanical" className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wider text-primary uppercase">
          Mesa
        </p>
        <h2
          id="catalog-mechanical"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          Na mesa
        </h2>
        <p className="text-sm text-muted-foreground">
          Ações e painéis do catálogo mecânico — os mesmos que a ficha usa.
        </p>
      </div>

      {groupByLevel(economyActions).map(([level, rows]) => (
        <div key={level} className="space-y-3">
          <h3 className="font-heading text-lg font-semibold">
            <span className="inline-flex items-center rounded-md bg-secondary/30 px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
              Nível {level}
            </span>
          </h3>
          <div className="space-y-3">
            {rows.map((action) => (
              <CollapsibleCard
                key={action.id}
                title={action.name}
                subtitle={`${economyBucketLabel(action.economy)} · nv. ${action.minLevel}`}
                defaultOpen={economyActions.length <= 4}
              >
                {action.description || action.summary ? (
                  <PhbProse
                    text={action.description ?? action.summary ?? ""}
                    className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem texto de mesa cadastrado.
                  </p>
                )}
              </CollapsibleCard>
            ))}
          </div>
        </div>
      ))}

      {panelActions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold">Painel</h3>
          <div className="space-y-3">
            {panelActions.map((action) => (
              <CollapsibleCard
                key={action.panelKey}
                title={action.title ?? action.name}
                subtitle={`nv. ${action.minLevel}`}
                defaultOpen={panelActions.length <= 4}
              >
                {action.description ? (
                  <PhbProse
                    text={action.description}
                    className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem texto de mesa cadastrado.
                  </p>
                )}
              </CollapsibleCard>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
