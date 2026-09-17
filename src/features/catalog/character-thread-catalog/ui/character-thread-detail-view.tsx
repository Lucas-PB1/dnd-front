"use client";

import { Suspense } from "react";

import type { CharacterThreadDetail } from "@/entities/character-thread/types";
import { characterThreadRankLabel } from "@/entities/character-thread/rank-label";
import { useCharacterThreadDetail } from "@/features/catalog/character-thread-catalog/api/use-character-threads";
import { CatalogOwnerMechanicalSection } from "@/features/catalog/shared/ui/catalog-owner-mechanical-section";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

type CharacterThreadDetailViewProps = {
  slug: string;
};

function ThreadHero({
  thread,
  backHref,
}: {
  thread: CharacterThreadDetail;
  backHref: string;
}) {
  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Threads"
      title={thread.name}
      summary={thread.summary}
    />
  );
}

function CharacterThreadDetailBody({ slug }: CharacterThreadDetailViewProps) {
  const threadQuery = useCharacterThreadDetail(slug);
  const backHref = useCatalogBackHref("/character-threads");

  if (threadQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (threadQuery.isError || !threadQuery.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message={
          threadQuery.error instanceof Error
            ? threadQuery.error.message
            : "Thread não encontrada"
        }
      />
    );
  }

  const thread = threadQuery.data;

  return (
    <div className="flex flex-col gap-12">
      <ThreadHero thread={thread} backHref={backHref} />

      {thread.specialRulesText ? (
        <section aria-labelledby="thread-rules" className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-primary uppercase">
              Regras
            </p>
            <h2
              id="thread-rules"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              Regras especiais
            </h2>
          </div>
          <PhbProse
            text={thread.specialRulesText}
            className="text-base leading-relaxed text-justify text-foreground/85 [&_p]:text-justify [&_p]:text-foreground/85"
          />
        </section>
      ) : null}

      <section aria-labelledby="thread-goals" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="thread-goals"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Objetivos
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha um objetivo na criação do personagem.
          </p>
        </div>
        {thread.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem objetivos listados.</p>
        ) : (
          <ol className="space-y-3">
            {thread.goals.map((goal) => (
              <li
                key={goal.sortOrder}
                className="flex gap-3 border-l-2 border-primary/40 pl-3"
              >
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {goal.sortOrder}.
                </span>
                <p className="text-sm text-foreground">{goal.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="thread-milestones" className="space-y-4">
        <div className="space-y-1">
          <h2
            id="thread-milestones"
            className="font-heading text-2xl font-semibold tracking-tight"
          >
            Marcos
          </h2>
        </div>
        {thread.milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem marcos listados.</p>
        ) : (
          <div className="space-y-3">
            {thread.milestones.map((milestone) => (
              <CollapsibleCard
                key={`${milestone.rank}-${milestone.id}`}
                title={characterThreadRankLabel(milestone.rank)}
              >
                <ul className="space-y-3">
                  {milestone.benefits.map((benefit) => (
                    <li key={benefit.benefitKey} className="space-y-1">
                      <p className="font-medium text-foreground">{benefit.name}</p>
                      <PhbProse text={benefit.description} className="text-sm" />
                    </li>
                  ))}
                </ul>
              </CollapsibleCard>
            ))}
          </div>
        )}
      </section>

      <CatalogOwnerMechanicalSection threadSlug={slug} />
    </div>
  );
}

export function CharacterThreadDetailView({
  slug,
}: CharacterThreadDetailViewProps) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}
    >
      <CharacterThreadDetailBody slug={slug} />
    </Suspense>
  );
}
