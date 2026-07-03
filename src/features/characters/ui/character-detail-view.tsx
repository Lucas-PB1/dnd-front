"use client";

import Link from "next/link";

import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import { useCharacterDetail } from "@/features/characters/api/use-character-detail";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CharacterDetailViewProps = {
  id: string;
};

export function CharacterDetailView({ id }: CharacterDetailViewProps) {
  const { data, isPending, isError, error } = useCharacterDetail(id);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando ficha…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Ficha não encontrada"}
        </p>
        <Link
          href="/characters"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  const abilities = Object.entries(data.abilityScores) as [
    keyof typeof data.abilityScores,
    number,
  ][];

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Link
          href="/characters"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Minhas fichas
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-muted-foreground">
          Nv. {data.level} · {data.speciesSlug} · {data.classSlug} ·{" "}
          {data.backgroundSlug}
        </p>
      </div>

      <dl className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Bônus de proficiência
          </dt>
          <dd className="text-lg font-mono">+{data.proficiencyBonus}</dd>
        </div>
        {data.hitPointsMax != null ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Pontos de vida
            </dt>
            <dd className="text-lg">
              {data.hitPointsCurrent ?? data.hitPointsMax} / {data.hitPointsMax}
            </dd>
          </div>
        ) : null}
        {data.subclassSlug ? (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Subclasse
            </dt>
            <dd>{data.subclassSlug}</dd>
          </div>
        ) : null}
      </dl>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Atributos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {abilities.map(([key, score]) => (
            <div
              key={key}
              className="rounded-lg border border-border px-3 py-2 text-center"
            >
              <p className="text-xs text-muted-foreground">
                {ABILITY_LABELS_PT[key]}
              </p>
              <p className="text-xl font-semibold">{score}</p>
              <p className="font-mono text-sm text-muted-foreground">
                {abilityModifier(score)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {(data.classSkillSlugs.length > 0 ||
        data.backgroundSkillSlugs.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Perícias</h2>
          <ul className="flex flex-wrap gap-2">
            {[...data.backgroundSkillSlugs, ...data.classSkillSlugs].map(
              (skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-border px-2 py-1 text-sm"
                >
                  {skill}
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {data.featSlugs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Talentos</h2>
          <ul className="flex flex-wrap gap-2">
            {data.featSlugs.map((feat) => (
              <li
                key={feat}
                className="rounded-md border border-border px-2 py-1 text-sm"
              >
                {feat}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
