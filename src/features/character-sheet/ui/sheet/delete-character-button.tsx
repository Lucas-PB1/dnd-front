"use client";

import { useState } from "react";

import { useDeleteCharacter } from "@/features/character-sheet/api/use-delete-character";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type DeleteCharacterButtonProps = {
  characterId: string;
  characterName: string;
  /** Lista: não redireciona de novo (já está em /characters). */
  stayOnList?: boolean;
  className?: string;
  size?: "sm" | "default";
};

export function DeleteCharacterButton({
  characterId,
  characterName,
  stayOnList = false,
  className,
  size = "sm",
}: DeleteCharacterButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteCharacter({ stayOnList });

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        className={cn(
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
          className,
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setConfirming(true);
        }}
      >
        Excluir
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 sm:flex-row sm:items-center",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Excluir <strong className="text-foreground">{characterName}</strong>?
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
          onClick={() => del.mutate(characterId)}
        >
          {del.isPending ? "Excluindo…" : "Confirmar"}
        </Button>
      </div>
      {del.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {del.error instanceof Error
            ? del.error.message
            : "Erro ao excluir ficha"}
        </p>
      ) : null}
    </div>
  );
}
