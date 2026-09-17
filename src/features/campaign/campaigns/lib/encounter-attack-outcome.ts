import type { EncounterAttackResult } from "@/features/campaign/campaigns/api/encounters.api";

export function encounterAttackHeadline(result: EncounterAttackResult): string {
  if (result.critical) {
    return `Crítico — ${result.attackExpression} = ${result.attackTotal} vs CA ${result.targetAc}`;
  }
  if (result.hit) {
    return `Acerto — ${result.attackExpression} = ${result.attackTotal} vs CA ${result.targetAc}`;
  }
  return `Erro — ${result.attackExpression} = ${result.attackTotal} vs CA ${result.targetAc}`;
}

export function encounterAttackDamageLine(
  result: EncounterAttackResult,
): string | null {
  if (!result.hit || result.damageTotal == null) return null;
  if (result.damageExpression) {
    return `Dano ${result.damageExpression} = ${result.damageTotal}`;
  }
  return `Dano ${result.damageTotal}`;
}
