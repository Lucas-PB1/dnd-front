import type { CharacterRollResult } from "@/features/character/character-sheet/api/character-rolls.api";

export type DamageRollChoice = "primary" | "alternate";

/**
 * Aplica a escolha do Atacante Selvagem.
 * A API já devolve `alternateRolls[0]` com o total completo (arma alternativa + extras).
 */
export function applyDamageRollChoice(
  result: CharacterRollResult,
  choice: DamageRollChoice,
): CharacterRollResult {
  const alternate = result.alternateRolls?.[0];
  if (!alternate) return result;

  if (choice === "primary") {
    return {
      ...result,
      alternateRolls: undefined,
      note: choiceNote(result.note, "escolheu a 1ª rolagem"),
    };
  }

  return {
    ...result,
    expression: alternate.expression,
    total: alternate.total,
    rolls: alternate.rolls,
    alternateRolls: undefined,
    note: choiceNote(result.note, "escolheu a 2ª rolagem"),
  };
}

export function hasPendingDamageRollChoice(
  result: CharacterRollResult | null | undefined,
): boolean {
  return Boolean(result?.alternateRolls && result.alternateRolls.length > 0);
}

function choiceNote(note: string | undefined, choiceLabel: string): string {
  const base = note
    ?.replace(
      /\s*Atacante Selvagem: escolha entre esta rolagem e alternateRolls\[0\] \(1×\/turno\)\./g,
      "",
    )
    .trim();
  const suffix = `Atacante Selvagem: ${choiceLabel}.`;
  return base ? `${base} · ${suffix}` : suffix;
}
