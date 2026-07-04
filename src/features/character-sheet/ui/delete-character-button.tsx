"use client";

import { useState } from "react";

import { useDeleteCharacter } from "@/features/character-sheet/api/use-delete-character";
import { Button } from "@/shared/ui/button";

type DeleteCharacterButtonProps = {
  characterId: string;
  characterName: string;
};

export function DeleteCharacterButton({
  characterId,
  characterName,
}: DeleteCharacterButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteCharacter();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirming(true)}
      >
        Excluir ficha
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">
        Excluir <strong>{characterName}</strong>? Esta ação não pode ser
        desfeita.
      </p>
      <div className="flex gap-2">
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
        <p className="text-sm text-destructive" role="alert">
          {del.error instanceof Error
            ? del.error.message
            : "Erro ao excluir ficha"}
        </p>
      ) : null}
    </div>
  );
}
