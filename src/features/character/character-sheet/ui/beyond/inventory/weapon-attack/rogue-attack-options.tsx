"use client";

import { cn } from "@/shared/lib/utils";
import type { CunningStrikeOption } from "@/features/character/character-sheet/lib/combat/available-cunning-strikes";

type RogueAttackOptionsProps = {
  subclassSlug?: string | null;
  level: number;
  sneakAttack: boolean;
  onSneakAttackChange: (value: boolean) => void;
  poisonousSneak: boolean;
  onPoisonousSneakChange: (value: boolean) => void;
  assassinSurprise: boolean;
  onAssassinSurpriseChange: (value: boolean) => void;
  assassinDeathStrike: boolean;
  onAssassinDeathStrikeChange: (value: boolean) => void;
  assassinPoisonFailedSave: boolean;
  onAssassinPoisonFailedSaveChange: (value: boolean) => void;
  availableCunningStrikes: CunningStrikeOption[];
  cunningStrikeEffects: string[];
  onToggleCunningStrike: (slug: string) => void;
};

export function RogueAttackOptions(props: RogueAttackOptionsProps) {
  const {
    subclassSlug,
    level,
    sneakAttack,
    availableCunningStrikes,
    cunningStrikeEffects,
  } = props;

  return (
    <div className="mt-2 rounded-md border border-border/60 bg-muted/15 p-2">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          className={cn(
            "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium",
            sneakAttack
              ? "border-secondary/50 bg-secondary/15 text-secondary"
              : "border-border/70 text-muted-foreground",
          )}
          aria-pressed={sneakAttack}
          onClick={() => props.onSneakAttackChange(!sneakAttack)}
        >
          Ataque Furtivo
        </button>
        {subclassSlug === "arachnoid-stalker" ? (
          <button
            type="button"
            className={cn(
              "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium",
              props.poisonousSneak
                ? "border-secondary/50 bg-secondary/15 text-secondary"
                : "border-border/70 text-muted-foreground",
            )}
            aria-pressed={props.poisonousSneak}
            onClick={() =>
              props.onPoisonousSneakChange(!props.poisonousSneak)
            }
          >
            Golpe Venenoso (d8)
          </button>
        ) : null}
        {subclassSlug === "assassin" ? (
          <>
            <button
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium",
                props.assassinSurprise
                  ? "border-secondary/50 bg-secondary/15 text-secondary"
                  : "border-border/70 text-muted-foreground",
              )}
              aria-pressed={props.assassinSurprise}
              onClick={() =>
                props.onAssassinSurpriseChange(!props.assassinSurprise)
              }
            >
              Golpe Surpreendente
            </button>
            {level >= 17 ? (
              <button
                type="button"
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium",
                  props.assassinDeathStrike
                    ? "border-secondary/50 bg-secondary/15 text-secondary"
                    : "border-border/70 text-muted-foreground",
                )}
                aria-pressed={props.assassinDeathStrike}
                title="Marque quando o alvo falhar na salvaguarda de Golpe Mortal"
                onClick={() =>
                  props.onAssassinDeathStrikeChange(!props.assassinDeathStrike)
                }
              >
                Golpe Mortal falhou
              </button>
            ) : null}
            {level >= 13 && cunningStrikeEffects.includes("poison") ? (
              <button
                type="button"
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium",
                  props.assassinPoisonFailedSave
                    ? "border-secondary/50 bg-secondary/15 text-secondary"
                    : "border-border/70 text-muted-foreground",
                )}
                aria-pressed={props.assassinPoisonFailedSave}
                onClick={() =>
                  props.onAssassinPoisonFailedSaveChange(
                    !props.assassinPoisonFailedSave,
                  )
                }
              >
                Envenenar falhou (+2d6)
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      {sneakAttack && availableCunningStrikes.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {availableCunningStrikes.map((effect) => (
            <button
              key={effect.slug}
              type="button"
              className={cn(
                "rounded border px-1.5 py-0.5 text-[0.65rem]",
                cunningStrikeEffects.includes(effect.slug)
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground",
              )}
              aria-pressed={cunningStrikeEffects.includes(effect.slug)}
              onClick={() => props.onToggleCunningStrike(effect.slug)}
            >
              {effect.label} −{effect.cost}d
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
