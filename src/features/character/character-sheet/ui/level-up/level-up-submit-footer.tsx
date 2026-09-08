"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import type { CharacterDetail } from "@/entities/character/types";
import type { LevelUpPayload } from "@/entities/character/session-types";
import { featOptionKeyLabel } from "@/features/character/create-character/lib/feats/validate-create-feat-options";
import { Button } from "@/shared/ui/button";

function formatLevelUpError(message: string): string {
  if (
    /Expertise skill '.+' (requires|exige) proficiency/i.test(message)
  ) {
    return "Especialização exige perícia em que você já é proficiente.";
  }
  if (/Expertise skill '.+' is not allowed/i.test(message)) {
    return "Essa perícia não é permitida para especialização desta classe.";
  }
  if (/unlocks subclass choices:/i.test(message)) {
    return "Complete as escolhas de subclasse deste nível (ex.: Revelações Santas) antes de subir.";
  }
  const spellUnavailable = message.match(
    /Spell '([^']+)' (?:is not|não é) available for this character's class\/subclass\/feats\/species/i,
  );
  if (spellUnavailable) {
    return `A magia “${spellUnavailable[1]}” não está disponível para esta classe/subclasse/talentos/espécie. Se veio de Revelações Santas, confira se as opções de subclasse estão salvas.`;
  }
  const featOptions = message.match(
    /Feat '([^']+)' instance \d+ (?:requires|exige) options:\s*(.+)$/i,
  );
  if (featOptions) {
    const keys = featOptions[2]
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean)
      .map(featOptionKeyLabel)
      .join(", ");
    return `O talento ${featOptions[1]} ainda precisa das escolhas: ${keys}. Complete o painel acima e salve.`;
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
