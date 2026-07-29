"use client";

import { cn } from "@/shared/lib/utils";

type RangerAttackOptionsProps = {
  huntersMark: boolean;
  onHuntersMarkChange: (value: boolean) => void;
  canColossusSlayer: boolean;
  colossusSlayer: boolean;
  onColossusSlayerChange: (value: boolean) => void;
  canDreadfulStrikes: boolean;
  dreadfulStrikes: boolean;
  onDreadfulStrikesChange: (value: boolean) => void;
};

function ToggleChip(props: {
  active: boolean;
  label: string;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium",
        props.active
          ? "border-secondary/50 bg-secondary/15 text-secondary"
          : "border-border/70 text-muted-foreground",
      )}
      aria-pressed={props.active}
      title={props.title}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
}

export function RangerAttackOptions(props: RangerAttackOptionsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <ToggleChip
        active={props.huntersMark}
        label="Marca do Predador"
        title="Adiciona o dado da Marca do Predador no dano"
        onClick={() => props.onHuntersMarkChange(!props.huntersMark)}
      />
      {props.canColossusSlayer ? (
        <ToggleChip
          active={props.colossusSlayer}
          label="Assassino de Colossos"
          title="+1d8 1×/turno vs alvo abaixo do máximo de PV"
          onClick={() => props.onColossusSlayerChange(!props.colossusSlayer)}
        />
      ) : null}
      {props.canDreadfulStrikes ? (
        <ToggleChip
          active={props.dreadfulStrikes}
          label="Golpes Terríveis"
          title="+1d4/+1d6 Psíquico 1×/turno"
          onClick={() =>
            props.onDreadfulStrikesChange(!props.dreadfulStrikes)
          }
        />
      ) : null}
    </div>
  );
}
