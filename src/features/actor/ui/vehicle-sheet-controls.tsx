"use client";

import type { ActorLiveState } from "@/entities/actor/types";
import { formatKgFromPounds } from "@/shared/lib/metric";
import { useVehicleSheetAction } from "@/features/actor/api/use-vehicle-sheet-action";
import { VitalStepper } from "@/features/actor/ui/vital-stepper";
import { Button } from "@/shared/ui/button";

type VehicleSheetControlsProps = {
  characterId: string;
  actorId: string;
  boarded: boolean;
  live: ActorLiveState | undefined;
  crewCapacity: number | null;
  passengerCapacity: number | null;
  cargoCapacityLb: number | null;
};

export function VehicleSheetControls({
  characterId,
  actorId,
  boarded,
  live,
  crewCapacity,
  passengerCapacity,
  cargoCapacityLb,
}: VehicleSheetControlsProps) {
  const action = useVehicleSheetAction(characterId);
  const crew = live?.crewCurrent ?? 0;
  const passengers = live?.passengerCurrent ?? 0;
  const cargoLb = live?.cargoCurrentLb ?? 0;
  const crewMax = live?.crewCapacity ?? crewCapacity;
  const passengerMax = live?.passengerCapacity ?? passengerCapacity;
  const cargoMax = live?.cargoCapacityLb ?? cargoCapacityLb;
  const pending = action.isPending;

  return (
    <div className="space-y-3 rounded-md border border-border/60 p-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Veículo
      </p>
      <VitalStepper
        id={`vehicle-crew-${actorId}`}
        label="Tripulação"
        value={crew}
        max={crewMax}
        disabled={pending}
        onChange={(next) =>
          action.mutate({
            action: "set-metrics",
            actorId,
            crewCurrent: next,
          })
        }
      />
      <VitalStepper
        id={`vehicle-passengers-${actorId}`}
        label="Passageiros"
        value={passengers}
        max={passengerMax}
        disabled={pending}
        onChange={(next) =>
          action.mutate({
            action: "set-metrics",
            actorId,
            passengerCurrent: next,
          })
        }
      />
      <div className="space-y-1">
        <VitalStepper
          id={`vehicle-cargo-${actorId}`}
          label="Carga"
          value={cargoLb}
          max={cargoMax}
          disabled={pending}
          onChange={(next) =>
            action.mutate({
              action: "set-metrics",
              actorId,
              cargoCurrentLb: next,
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          {formatKgFromPounds(cargoLb)}
          {cargoMax != null ? ` / ${formatKgFromPounds(cargoMax)}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending || !boarded}
          onClick={() =>
            action.mutate({
              action: "helm",
              actorId,
            })
          }
        >
          Leme
        </Button>
        {boarded ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              action.mutate({
                action: "dismount",
                actorId,
              })
            }
          >
            Desembarcar
          </Button>
        ) : null}
      </div>
      {action.data?.note ? (
        <p className="text-xs text-secondary" role="status">
          {action.data.note}
        </p>
      ) : null}
      {action.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {action.error instanceof Error
            ? action.error.message
            : "Falha na ação do veículo"}
        </p>
      ) : null}
    </div>
  );
}
