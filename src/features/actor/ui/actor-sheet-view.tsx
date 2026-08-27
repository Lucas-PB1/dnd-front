"use client";

import Link from "next/link";

import { useActorDetail } from "@/features/actor/api/use-actors";
import { ActorSheetBody } from "@/features/actor/ui/actor-sheet-body";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type ActorSheetViewProps = {
  id: string;
};

export function ActorSheetView({ id }: ActorSheetViewProps) {
  const query = useActorDetail(id);

  return (
    <AppPageShell width="sheet" className="min-h-dvh">
      {query.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando ficha…</p>
      ) : query.isError || !query.data ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">Ficha não encontrada.</p>
          <Link
            href="/characters"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Meus personagens
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {query.data.parentCharacterId ? (
            <Link
              href={`/characters/${query.data.parentCharacterId}`}
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Ver personagem vinculado
            </Link>
          ) : null}
          <ActorSheetBody actor={query.data} hideParentLink />
        </div>
      )}
    </AppPageShell>
  );
}
