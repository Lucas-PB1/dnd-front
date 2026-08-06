"use client";

import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type PaladinSmiteControlsProps = {
  busy: boolean;
  smiteSlots: { level: number; remaining: number }[];
  selectedSmiteSlot: number;
  onSmiteSlotChange: (level: number) => void;
  smiteVsUndeadOrFiend: boolean;
  onSmiteVsUndeadOrFiendChange: (value: boolean) => void;
  onSmite: () => void;
};

export function PaladinSmiteControls(props: PaladinSmiteControlsProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/70 px-1.5 py-0.5">
      <SearchableSelect
        aria-label="Círculo do espaço de magia para a Destruição Divina"
        className="h-7 min-w-[6.5rem] text-xs"
        value={String(props.selectedSmiteSlot)}
        options={props.smiteSlots.map((slot) => ({
          value: String(slot.level),
          label: `${slot.level}º (${slot.remaining})`,
        }))}
        onValueChange={(next) => props.onSmiteSlotChange(Number(next))}
      />
      <label className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
        <input
          type="checkbox"
          checked={props.smiteVsUndeadOrFiend}
          onChange={(event) =>
            props.onSmiteVsUndeadOrFiendChange(event.target.checked)
          }
        />
        +1d8
      </label>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={props.busy}
        title="Destruição Divina: gasta um espaço de magia e adiciona 2d8 Radiante (+1d8 por círculo acima do 1º)"
        onClick={props.onSmite}
      >
        Destruição Divina
      </Button>
    </span>
  );
}
