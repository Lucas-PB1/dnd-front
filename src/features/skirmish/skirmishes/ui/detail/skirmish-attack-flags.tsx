"use client";

import type { ResolveSkirmishAttackPayload } from "@/features/skirmish/skirmishes/api/skirmishes.schema";
import type {
  RemainingSpellSlot,
  SkirmishAttackFlagKey,
} from "@/features/skirmish/skirmishes/lib/skirmish-attack-flag-availability";

const FLAG_LABELS: Record<SkirmishAttackFlagKey, string> = {
  sneakAttack: "Ataque Furtivo",
  divineSmite: "Golpe Divino",
  smiteVsUndeadOrFiend: "Golpe vs morto-vivo/demônio",
  huntersMark: "Marca do Caçador",
  colossusSlayer: "Matador de Colossos",
  divineStrike: "Golpe Sagrado",
  graze: "Resvalar",
  steadyAim: "Mira Firme",
  spentInspiration: "Inspiração",
  assassinate: "Assassinar",
  brutalStrike: "Golpe Brutal",
  strokeOfLuck: "Golpe de Sorte",
};

export type SkirmishAttackFlagsState = Partial<
  Record<SkirmishAttackFlagKey, boolean>
> & {
  smiteSlotLevel?: number;
};

export function SkirmishAttackFlags({
  visibleKeys,
  value,
  onChange,
  smiteSlots = [],
}: {
  visibleKeys: readonly SkirmishAttackFlagKey[];
  value: SkirmishAttackFlagsState;
  onChange: (next: SkirmishAttackFlagsState) => void;
  smiteSlots?: readonly RemainingSpellSlot[];
}) {
  if (visibleKeys.length === 0) return null;

  const slotOptions =
    smiteSlots.length > 0
      ? smiteSlots
      : [{ level: value.smiteSlotLevel ?? 1, remaining: 1 }];

  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-muted/15 p-2.5">
      <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        Opções no ataque
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {visibleKeys.map((key) => (
          <label
            key={key}
            className="flex items-center gap-1.5 text-xs text-foreground"
          >
            <input
              type="checkbox"
              checked={Boolean(value[key])}
              onChange={(event) =>
                onChange({ ...value, [key]: event.target.checked })
              }
            />
            {FLAG_LABELS[key]}
          </label>
        ))}
      </div>
      {visibleKeys.includes("divineSmite") && value.divineSmite ? (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Espaço de magia
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            value={value.smiteSlotLevel ?? slotOptions[0]?.level ?? 1}
            onChange={(event) =>
              onChange({
                ...value,
                smiteSlotLevel: Number(event.target.value),
              })
            }
          >
            {slotOptions.map((slot) => (
              <option key={slot.level} value={slot.level}>
                Nível {slot.level} ({slot.remaining})
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}

export function attackPayloadFromFlags(
  flags: SkirmishAttackFlagsState,
  visibleKeys: readonly SkirmishAttackFlagKey[],
): Partial<ResolveSkirmishAttackPayload> {
  const payload: Partial<ResolveSkirmishAttackPayload> = {};
  for (const key of visibleKeys) {
    if (flags[key]) payload[key] = true;
  }
  if (visibleKeys.includes("divineSmite") && flags.divineSmite) {
    payload.smiteSlotLevel = flags.smiteSlotLevel ?? 1;
  }
  return payload;
}
