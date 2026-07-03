"use client";

import Link from "next/link";

import { useSpeciesDetail } from "@/features/species-catalog/api/use-species";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type SpeciesDetailViewProps = {
  slug: string;
};

export function SpeciesDetailView({ slug }: SpeciesDetailViewProps) {
  const { data, isPending, isError, error } = useSpeciesDetail(slug);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Espécie não encontrada"}
        </p>
        <Link
          href="/species"
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
          href="/species"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Espécies
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-muted-foreground">
          {data.creatureType} · {data.size} · deslocamento {data.speed}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
        {data.description}
      </p>
    </div>
  );
}
