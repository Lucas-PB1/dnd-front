"use client";

import Link from "next/link";

import { useSpellDetail } from "@/features/spell-catalog/api/use-spells";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type SpellDetailViewProps = {
  slug: string;
};

export function SpellDetailView({ slug }: SpellDetailViewProps) {
  const { data, isPending, isError, error } = useSpellDetail(slug);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando magia…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Magia não encontrada"}
        </p>
        <Link
          href="/spells"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Link
          href="/spells"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Magias
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-muted-foreground">
          {data.levelLabel} · {data.schoolName}
          {data.concentration ? " · Concentração" : ""}
          {data.ritual ? " · Ritual" : ""}
        </p>
      </div>

      <dl className="grid gap-3 rounded-lg border border-border p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Tempo</dt>
          <dd>{data.castingTime}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Alcance</dt>
          <dd>{data.range}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Componentes
          </dt>
          <dd>{data.componentsLabel ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Duração</dt>
          <dd>{data.duration}</dd>
        </div>
      </dl>

      <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
        {data.description}
      </p>

      {data.higherLevels ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Em níveis superiores</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {data.higherLevels}
          </p>
        </section>
      ) : null}
    </div>
  );
}
