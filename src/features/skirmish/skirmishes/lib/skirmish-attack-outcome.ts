import type { SkirmishAttackResult } from "@/features/skirmish/skirmishes/api/skirmishes.schema";

function facesSuffix(rolls: number[] | undefined): string {
  if (!rolls || rolls.length === 0) return "";
  return ` [${rolls.join(", ")}]`;
}

export function skirmishAttackHeadline(result: SkirmishAttackResult): string {
  const dice = `${result.attackExpression}${facesSuffix(result.attackRolls)} = ${result.attackTotal} vs CA ${result.targetAc}`;
  if (result.critical) {
    return `Crítico — ${dice}`;
  }
  if (result.hit) {
    return `Acerto — ${dice}`;
  }
  return `Erro — ${dice}`;
}

export function skirmishAttackDamageLine(
  result: SkirmishAttackResult,
): string | null {
  if (result.damageTotal == null) return null;
  if (result.damageExpression) {
    return `Dano ${result.damageExpression}${facesSuffix(result.damageRolls)} = ${result.damageTotal}`;
  }
  return `Dano ${result.damageTotal}`;
}
