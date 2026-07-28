"use client";

import { useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";

import type { WeaponAttackSummary } from "@/entities/character/types";
import { formatSkillBonus } from "@/entities/character";
import type { AdvantageMode } from "@/features/character-sheet/api/character-rolls.api";
import { useSheetRolls } from "@/features/character-sheet/ui/beyond/sheet-rolls";
import { ABILITY_SHORT } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { SheetChip } from "@/features/character-sheet/ui/sheet-ui";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type WeaponAttackCardProps = {
  attack: WeaponAttackSummary;
};

const ADVANTAGE_OPTIONS: { id: AdvantageMode; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "advantage", label: "Vant." },
  { id: "disadvantage", label: "Desv." },
];

function modeLabel(attack: WeaponAttackSummary): string {
  const base = attack.mode === "ranged" ? "à distância" : "corpo a corpo";
  if (attack.role === "light_bonus") {
    return attack.nickUsesAttackAction
      ? `${base} · adicional (Ágil)`
      : `${base} · adicional (Leve)`;
  }
  if (attack.role === "dual_bonus") return `${base} · adicional (Ambidestro)`;
  return base;
}

function AttackBadges({ attack }: { attack: WeaponAttackSummary }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      <SheetChip active>
        {ABILITY_SHORT[attack.abilitySlug] ?? attack.abilitySlug}
      </SheetChip>
      {!attack.proficient ? <SheetChip>sem prof.</SheetChip> : null}
      {attack.greatWeaponFighting ? <SheetChip active>GWF</SheetChip> : null}
      {attack.omitsAbilityDamage ? (
        <SheetChip>sem mod. no dano</SheetChip>
      ) : null}
      {attack.masteryActive && attack.masteryName ? (
        <SheetChip active>{attack.masteryName}</SheetChip>
      ) : null}
      {attack.attackDisadvantage ? (
        <SheetChip className="border-destructive/40 bg-destructive/10 text-destructive">
          desvantagem
        </SheetChip>
      ) : null}
    </div>
  );
}

export function WeaponAttackCard({ attack }: WeaponAttackCardProps) {
  const rolls = useSheetRolls();
  const busy = rolls.attack.isPending || rolls.damage.isPending;
  const [advantage, setAdvantage] = useState<AdvantageMode>(
    attack.attackDisadvantage ? "disadvantage" : "normal",
  );

  return (
    <li className="flex gap-3 rounded-lg border border-border/70 bg-card/60 px-3 py-2.5">
      <span
        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-secondary/35 bg-secondary/10 text-secondary"
        aria-hidden
      >
        <CubeIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold tracking-tight">
              {attack.itemName}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {modeLabel(attack)}
              </span>
            </p>
            <AttackBadges attack={attack} />
          </div>
          <div className="flex shrink-0 gap-1.5">
            <p
              className={cn(
                "rounded-md border px-2 py-0.5 font-mono text-sm font-semibold tabular-nums",
                attack.attackDisadvantage
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-primary/30 bg-primary/8 text-primary",
              )}
              title="Bônus de ataque"
            >
              {formatSkillBonus(attack.attackBonus)}
            </p>
            <p
              className="rounded-md border border-border/80 bg-muted/30 px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-foreground"
              title="Dano"
            >
              {attack.damageNote}
              {attack.damageType ? (
                <span className="ml-1 text-[0.65rem] font-normal text-muted-foreground">
                  {attack.damageType}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {attack.attackNote ? (
          <p className="mt-1.5 text-[0.7rem] text-muted-foreground/90">
            {attack.attackNote}
          </p>
        ) : null}

        <div
          className="mt-2 flex flex-wrap gap-1"
          role="group"
          aria-label={`Vantagem — ${attack.itemName}`}
        >
          {ADVANTAGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                advantage === option.id
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={advantage === option.id}
              onClick={() => setAdvantage(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              rolls.attack.mutate({
                itemSlug: attack.itemSlug,
                mode: attack.mode,
                advantage,
              })
            }
          >
            Atacar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              rolls.damage.mutate({
                itemSlug: attack.itemSlug,
                mode: attack.mode,
              })
            }
          >
            Dano
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              rolls.damage.mutate({
                itemSlug: attack.itemSlug,
                mode: attack.mode,
                critical: true,
              })
            }
          >
            Crítico
          </Button>
          {attack.grazeOnMissDamage != null ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                rolls.damage.mutate({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  grazeMiss: true,
                })
              }
            >
              Erro (Garantido · {formatSkillBonus(attack.grazeOnMissDamage)})
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
