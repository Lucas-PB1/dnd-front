"use client";

import { useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";

import type { WeaponAttackSummary } from "@/entities/character/types";
import { formatSkillBonus } from "@/entities/character";
import type { AdvantageMode } from "@/features/character/character-sheet/api/character-rolls.api";
import { availableCunningStrikes as resolveCunningStrikes } from "@/features/character/character-sheet/lib/combat/available-cunning-strikes";
import { buildWeaponDamagePayload } from "@/features/character/character-sheet/lib/combat/build-weapon-damage-payload";
import { useCombatMechanicalCatalog } from "@/features/catalog/reference-catalog/api/use-reference";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import {
  AttackBadges,
  modeLabel,
} from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack/attack-badges";
import { PaladinSmiteControls } from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack/paladin-smite-controls";
import { RangerAttackOptions } from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack/ranger-attack-options";
import { RogueAttackOptions } from "@/features/character/character-sheet/ui/beyond/inventory/weapon-attack/rogue-attack-options";
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
  onPsiStrikeResolved?: () => void | Promise<void>;
  rogue?: {
    level: number;
    subclassSlug?: string | null;
  };
  paladin?: {
    smiteSlots: { level: number; remaining: number }[];
  };
  onDivineSmiteResolved?: () => void | Promise<void>;
  ranger?: {
    level: number;
    subclassSlug?: string | null;
  };
  onDreadAmbusherResolved?: () => void | Promise<void>;
  cleric?: {
    level: number;
  };
};

const ADVANTAGE_OPTIONS: { id: AdvantageMode; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "advantage", label: "Vant." },
  { id: "disadvantage", label: "Desv." },
];

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
  onPsiStrikeResolved,
  rogue,
  paladin,
  onDivineSmiteResolved,
  ranger,
  onDreadAmbusherResolved,
  cleric,
}: WeaponAttackCardProps) {
  const rolls = useSheetRolls();
  const mechanicalCatalog = useCombatMechanicalCatalog(rogue ? { classSlug: "rogue", subclassSlug: rogue.subclassSlug } : undefined);
  const busy = rolls.attack.isPending || rolls.damage.isPending;
  const [advantage, setAdvantage] = useState<AdvantageMode>(
    attack.attackDisadvantage ? "disadvantage" : "normal",
  );
  const [automatic, setAutomatic] = useState(false);
  const [studiedAttack, setStudiedAttack] = useState(false);
  const [doorKick, setDoorKick] = useState(false);
  const [sneakAttack, setSneakAttack] = useState(false);
  const [steadyAim, setSteadyAim] = useState(false);
  const [poisonousSneak, setPoisonousSneak] = useState(false);
  const [assassinSurprise, setAssassinSurprise] = useState(false);
  const [assassinate, setAssassinate] = useState(false);
  const [assassinDeathStrike, setAssassinDeathStrike] = useState(false);
  const [assassinPoisonFailedSave, setAssassinPoisonFailedSave] =
    useState(false);
  const [strokeOfLuck, setStrokeOfLuck] = useState(false);
  const [cunningStrikeEffects, setCunningStrikeEffects] = useState<string[]>(
    [],
  );
  const smiteSlots = (paladin?.smiteSlots ?? []).filter(
    (slot) => slot.remaining > 0,
  );
  const canDivineSmite = attack.mode === "melee" && smiteSlots.length > 0;
  const [smiteSlotLevel, setSmiteSlotLevel] = useState<number | null>(null);
  const [smiteVsUndeadOrFiend, setSmiteVsUndeadOrFiend] = useState(false);
  const selectedSmiteSlot =
    smiteSlotLevel ?? (smiteSlots.length > 0 ? smiteSlots[0].level : null);
  const [huntersMark, setHuntersMark] = useState(false);
  const [preciseHunter, setPreciseHunter] = useState(false);
  const [colossusSlayer, setColossusSlayer] = useState(false);
  const [dreadfulStrikes, setDreadfulStrikes] = useState(false);
  const [divineStrike, setDivineStrike] = useState(false);
  const canPreciseHunter = Boolean(ranger && ranger.level >= 17);
  const canColossusSlayer = Boolean(
    ranger?.subclassSlug === "hunter" && ranger.level >= 3,
  );
  const canDreadfulStrikes = Boolean(
    ranger?.subclassSlug === "fey-wanderer" && ranger.level >= 3,
  );
  const canDreadAmbusher = Boolean(
    ranger?.subclassSlug === "gloom-stalker" && ranger.level >= 3,
  );
  const hasChamber = attack.reloadCapacity != null;
  const shotsLeft =
    chamberRemaining ?? (hasChamber ? attack.reloadCapacity : null);
  const canSneakAttack = Boolean(rogue && attack.sneakAttackEligible);
  const maxCunningEffects = (rogue?.level ?? 0) >= 11 ? 2 : 1;
  const availableCunningStrikes =
    rogue && mechanicalCatalog.data
      ? resolveCunningStrikes(mechanicalCatalog.data.cunningStrikeEffects, {
          level: rogue.level,
          subclassSlug: rogue.subclassSlug,
        })
      : [];

  function toggleCunningStrike(slug: string) {
    setCunningStrikeEffects((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= maxCunningEffects) {
        return [...current.slice(1), slug];
      }
      return [...current, slug];
    });
  }

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
          {rogue && rogue.level >= 3 ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                steadyAim
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={steadyAim}
              onClick={() => setSteadyAim((value) => !value)}
            >
              Mira Firme
            </button>
          ) : null}
          {rogue?.level === 20 ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                strokeOfLuck
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={strokeOfLuck}
              title="Use após falhar: transforma o resultado do d20 em 20 e gasta o uso"
              onClick={() => setStrokeOfLuck((value) => !value)}
            >
              Golpe de Sorte
            </button>
          ) : null}
          {rogue?.subclassSlug === "assassin" ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                assassinate
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={assassinate}
              title="Primeira rodada, contra criatura que ainda não agiu"
              onClick={() => setAssassinate((value) => !value)}
            >
              Assassinar
            </button>
          ) : null}
          {canPreciseHunter ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                preciseHunter
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={preciseHunter}
              title="Vantagem contra a criatura marcada pela Marca do Predador"
              onClick={() => setPreciseHunter((value) => !value)}
            >
              Caçador Preciso
            </button>
          ) : null}
          {cleric && cleric.level >= 7 ? (
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                divineStrike
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={divineStrike}
              title="Golpe Divino, se escolhido em Golpes Abençoados (1× por turno)"
              onClick={() => setDivineStrike((value) => !value)}
            >
              Golpe Divino
            </button>
          ) : null}
        </div>

        {ranger ? (
          <RangerAttackOptions
            huntersMark={huntersMark}
            onHuntersMarkChange={setHuntersMark}
            canColossusSlayer={canColossusSlayer}
            colossusSlayer={colossusSlayer}
            onColossusSlayerChange={setColossusSlayer}
            canDreadfulStrikes={canDreadfulStrikes}
            dreadfulStrikes={dreadfulStrikes}
            onDreadfulStrikesChange={setDreadfulStrikes}
          />
        ) : null}

        {canSneakAttack && rogue ? (
          <RogueAttackOptions
            subclassSlug={rogue.subclassSlug}
            level={rogue.level}
            sneakAttack={sneakAttack}
            onSneakAttackChange={setSneakAttack}
            poisonousSneak={poisonousSneak}
            onPoisonousSneakChange={setPoisonousSneak}
            assassinSurprise={assassinSurprise}
            onAssassinSurpriseChange={setAssassinSurprise}
            assassinDeathStrike={assassinDeathStrike}
            onAssassinDeathStrikeChange={setAssassinDeathStrike}
            assassinPoisonFailedSave={assassinPoisonFailedSave}
            onAssassinPoisonFailedSaveChange={setAssassinPoisonFailedSave}
            availableCunningStrikes={availableCunningStrikes}
            cunningStrikeEffects={cunningStrikeEffects}
            onToggleCunningStrike={toggleCunningStrike}
          />
        ) : null}

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
                steadyAim: steadyAim || undefined,
                strokeOfLuck: strokeOfLuck || undefined,
                assassinate: assassinate || undefined,
                preciseHunter: preciseHunter || undefined,
              });
              setStrokeOfLuck(false);
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
              rolls.damage.mutate(
                buildWeaponDamagePayload({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  sightedReroll:
                    attack.masteryActive && attack.masterySlug === "sighted",
                  sneakAttack,
                  cunningStrikeEffects,
                  poisonousSneak,
                  assassinSurprise,
                  assassinDeathStrike,
                  assassinPoisonFailedSave,
                  huntersMark,
                  colossusSlayer,
                  dreadfulStrikes,
                  divineStrike,
                }),
              )
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
              rolls.damage.mutate(
                buildWeaponDamagePayload({
                  itemSlug: attack.itemSlug,
                  mode: attack.mode,
                  critical: true,
                  sneakAttack,
                  cunningStrikeEffects,
                  poisonousSneak,
                  assassinSurprise,
                  assassinDeathStrike,
                  assassinPoisonFailedSave,
                  huntersMark,
                  colossusSlayer,
                  dreadfulStrikes,
                  divineStrike,
                }),
              )
            }
          >
            Crítico
          </Button>
          {canDivineSmite && selectedSmiteSlot != null ? (
            <PaladinSmiteControls
              busy={busy}
              smiteSlots={smiteSlots}
              selectedSmiteSlot={selectedSmiteSlot}
              onSmiteSlotChange={setSmiteSlotLevel}
              smiteVsUndeadOrFiend={smiteVsUndeadOrFiend}
              onSmiteVsUndeadOrFiendChange={setSmiteVsUndeadOrFiend}
              onSmite={() =>
                rolls.damage.mutate(
                  buildWeaponDamagePayload({
                    itemSlug: attack.itemSlug,
                    mode: attack.mode,
                    divineSmite: true,
                    smiteSlotLevel: selectedSmiteSlot,
                    smiteVsUndeadOrFiend,
                  }),
                  { onSuccess: () => onDivineSmiteResolved?.() },
                )
              }
            />
          ) : null}
          {canDreadAmbusher ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              title="Golpe Terrível: gasta 1 uso de Emboscador das Sombras"
              onClick={() =>
                rolls.damage.mutate(
                  {
                    itemSlug: attack.itemSlug,
                    mode: attack.mode,
                    dreadAmbusher: true,
                    huntersMark: huntersMark || undefined,
                  },
                  { onSuccess: () => onDreadAmbusherResolved?.() },
                )
              }
            >
              Golpe Terrível
            </Button>
          ) : null}
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
              title="Gasta 1 Dado de Energia Psiônica e rola o dano extra"
              onClick={() =>
                rolls.damage.mutate(
                  {
                    itemSlug: attack.itemSlug,
                    mode: attack.mode,
                    psiStrike: true,
                  },
                  { onSuccess: () => onPsiStrikeResolved?.() },
                )
              }
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
