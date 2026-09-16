"use client";

import { useState } from "react";

import { useDeleteActor } from "@/features/actor/api/use-actors";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type DeleteActorButtonProps = {
  actorId: string;
  actorName: string;
  className?: string;
};

export function DeleteActorButton({
  actorId,
  actorName,
  className,
}: DeleteActorButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteActor(actorId);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
          className,
        )}
        onClick={() => setConfirming(true)}
      >
        Excluir actor
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Excluir <strong className="text-foreground">{actorName}</strong>? Esta
        ação não pode ser desfeita.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={del.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={del.isPending}
          onClick={() => del.mutate()}
        >
          {del.isPending ? "Excluindo…" : "Confirmar"}
        </Button>
      </div>
      {del.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {del.error instanceof Error
            ? del.error.message
            : "Erro ao excluir actor"}
        </p>
      ) : null}
    </div>
  );
}
