"use client";

import type { WeaponAttackSummary } from "@/entities/character/types";
import { ABILITY_SHORT } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";

export function modeLabel(attack: WeaponAttackSummary): string {
  const base = attack.mode === "ranged" ? "à distância" : "corpo a corpo";
  if (attack.role === "light_bonus") {
    return attack.nickUsesAttackAction
      ? `${base} · adicional (Ágil)`
      : `${base} · adicional (Leve)`;
  }
  if (attack.role === "dual_bonus") return `${base} · adicional (Ambidestro)`;
  return base;
}

export function AttackBadges({ attack }: { attack: WeaponAttackSummary }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      <SheetChip active>
        {ABILITY_SHORT[attack.abilitySlug] ?? attack.abilitySlug}
      </SheetChip>
      {!attack.proficient ? <SheetChip>sem prof.</SheetChip> : null}
      {attack.isFirearm ? <SheetChip active>arma de fogo</SheetChip> : null}
      {attack.hasRecoil ? <SheetChip>recuo</SheetChip> : null}
      {attack.reloadCapacity != null ? (
        <SheetChip>recarga {attack.reloadCapacity}</SheetChip>
      ) : null}
      {attack.critThreshold != null && attack.critThreshold < 20 ? (
        <SheetChip active>crít. {attack.critThreshold}–20</SheetChip>
      ) : null}
      {attack.greatWeaponFighting ? <SheetChip active>GWF</SheetChip> : null}
      {attack.omitsAbilityDamage ? (
        <SheetChip>sem mod. no dano</SheetChip>
      ) : null}
      {attack.overkillExtraDice ? (
        <SheetChip active>Exagero +{attack.overkillExtraDice}</SheetChip>
      ) : null}
      {attack.rageDamageBonus ? (
        <SheetChip active>Fúria +{attack.rageDamageBonus}</SheetChip>
      ) : null}
      {attack.brutalStrikeDice ? (
        <SheetChip>Golpe Brutal {attack.brutalStrikeDice}</SheetChip>
      ) : null}
      {attack.masteryActive && attack.masteryName ? (
        <SheetChip active>{attack.masteryName}</SheetChip>
      ) : null}
      {attack.attachedCharmName ? (
        <SheetChip active>{attack.attachedCharmName}</SheetChip>
      ) : null}
      {attack.attackDisadvantage ? (
        <SheetChip className="border-destructive/40 bg-destructive/10 text-destructive">
          desvantagem
        </SheetChip>
      ) : null}
    </div>
  );
}
