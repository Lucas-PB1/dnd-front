"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import type { CharacterDetail } from "@/entities/character/types";
import type { LevelUpPayload } from "@/entities/character/session-types";
import { Button } from "@/shared/ui/button";

function formatLevelUpError(message: string): string {
  if (/Expertise skill '.+' requires proficiency/i.test(message)) {
    return "Especialização exige perícia em que você já é proficiente.";
  }
  if (/Expertise skill '.+' is not allowed/i.test(message)) {
    return "Essa perícia não é permitida para especialização desta classe.";
  }
  return message;
}

type LevelUpSubmitFooterProps = {
  nextLevel: number;
  levelUpError?: string;
  disabled: boolean;
  levelUp: UseMutationResult<
    CharacterDetail | undefined,
    Error,
    LevelUpPayload,
    unknown
  >;
  onSubmit: () => void;
};

export function LevelUpSubmitFooter({
  nextLevel,
  levelUpError,
  disabled,
  levelUp,
  onSubmit,
}: LevelUpSubmitFooterProps) {
  return (
    <>
      {levelUpError ? (
        <p className="text-sm text-destructive" role="alert">
          {formatLevelUpError(levelUpError)}
        </p>
      ) : null}

      <Button
        type="button"
        disabled={disabled || levelUp.isPending}
        onClick={onSubmit}
      >
        {levelUp.isPending
          ? "Subindo de nível…"
          : `Subir para nível ${nextLevel}`}
      </Button>

      {levelUp.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {levelUp.error instanceof Error
            ? formatLevelUpError(levelUp.error.message)
            : "Erro ao subir de nível"}
        </p>
      ) : null}

      {levelUp.isSuccess ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Nível atualizado com sucesso.
        </p>
      ) : null}
    </>
  );
}
