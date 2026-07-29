"use client";

import { useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";

import type { WeaponAttackSummary } from "@/entities/character/types";
import { formatSkillBonus } from "@/entities/character";
import type { AdvantageMode } from "@/features/character/character-sheet/api/character-rolls.api";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { ABILITY_SHORT } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type WeaponAttackCardProps = {
  attack: WeaponAttackSummary;
  chamberRemaining?: number | null;
  onReload?: (itemSlug: string) => void;
  onFire?: (itemSlug: string, shots?: number) => void;
  onHeadShot?: () => void | Promise<void>;
  canHeadShot?: boolean;
  canStudiedAttack?: boolean;
  canDoorKick?: boolean;
  canPsiStrike?: boolean;
  canMonsterSlayer?: boolean;
  onSpendPsi?: () => void | Promise<void>;
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
      {attack.attackDisadvantage ? (
        <SheetChip className="border-destructive/40 bg-destructive/10 text-destructive">
          desvantagem
        </SheetChip>
      ) : null}
    </div>
  );
}

export function WeaponAttackCard({
  attack,
  chamberRemaining,
  onReload,
  onFire,
  onHeadShot,
  canHeadShot = false,
  canStudiedAttack = false,
  canDoorKick = false,
  canPsiStrike = false,
  canMonsterSlayer = false,
  onSpendPsi,
}: WeaponAttackCardProps) {
  const rolls = useSheetRolls();
  const busy = rolls.attack.isPending || rolls.damage.isPending;
  const [advantage, setAdvantage] = useState<AdvantageMode>(
    attack.attackDisadvantage ? "disadvantage" : "normal",
  );
  const [automatic, setAutomatic] = useState(false);
  const [studiedAttack, setStudiedAttack] = useState(false);
  const [doorKick, setDoorKick] = useState(false);
  const hasChamber = attack.reloadCapacity != null;
  const shotsLeft =
    chamberRemaining ?? (hasChamber ? attack.reloadCapacity : null);

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
            {hasChamber ? (
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                Câmara: {shotsLeft ?? "—"}/{attack.reloadCapacity}
              </p>
            ) : null}
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
          {attack.masteryActive && attack.masterySlug === "automatic" ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                automatic
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={automatic}
              onClick={() => setAutomatic((value) => !value)}
            >
              Automática
            </button>
          ) : null}
          {canStudiedAttack ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                studiedAttack
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={studiedAttack}
              onClick={() => setStudiedAttack((value) => !value)}
            >
              Estudado
            </button>
          ) : null}
          {canDoorKick ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                doorKick
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={doorKick}
              onClick={() => setDoorKick((value) => !value)}
            >
              1ª rodada
            </button>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              if (hasChamber && onFire) {
                onFire(attack.itemSlug, automatic ? 2 : 1);
              }
              rolls.attack.mutate({
                itemSlug: attack.itemSlug,
                mode: attack.mode,
                advantage,
                automatic: automatic || undefined,
                studiedAttack: studiedAttack || undefined,
                doorKick: doorKick || undefined,
              });
            }}
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
                sightedReroll:
                  attack.masteryActive && attack.masterySlug === "sighted"
                    ? true
                    : undefined,
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
          {attack.brutalStrikeDice ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              title={`Golpe Brutal: +${attack.brutalStrikeDice} de dano (abre mão da vantagem do Imprudente)`}
              onClick={() =>
                rolls.damage.mutate({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  brutalStrike: true,
                })
              }
            >
              Golpe Brutal (+{attack.brutalStrikeDice})
            </Button>
          ) : null}
          {canPsiStrike ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              title="Gasta 1 Dado de Energia Psiônica"
              onClick={async () => {
                if (onSpendPsi) await onSpendPsi();
                rolls.damage.mutate({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  psiStrike: true,
                });
              }}
            >
              Golpe Psiônico
            </Button>
          ) : null}
          {canMonsterSlayer ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              title=" +1d10 vs Aberração, Dragão, Feérico, Corruptor, Monstruosidade, Gosma ou Morto-vivo"
              onClick={() =>
                rolls.damage.mutate({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  monsterSlayer: true,
                })
              }
            >
              Matar Monstro (+1d10)
            </Button>
          ) : null}
          {canHeadShot ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              title="Gasta 3 Dados de Risco para usar Tiro na cabeça"
              onClick={async () => {
                if (onHeadShot) await onHeadShot();
                rolls.damage.mutate({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  critical: true,
                  headShot: true,
                });
              }}
            >
              Tiro na cabeça (3 Risco)
            </Button>
          ) : null}
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
          {hasChamber && onReload ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onReload(attack.itemSlug)}
            >
              Recarregar
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
