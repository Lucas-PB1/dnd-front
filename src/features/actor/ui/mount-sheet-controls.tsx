"use client";

import { useState } from "react";

import type { ActorLiveState } from "@/entities/actor/types";
import {
  isCelestialSteedTemplate,
  isFeySteedTemplate,
  isFiendSteedTemplate,
  mountLongRestUseSpent,
  MOUNT_HEALING_TOUCH_MIN_AMOUNT,
  MOUNT_LONG_REST_USE_KEY,
  type MountSheetHealTarget,
} from "@/entities/actor/mount-sheet";
import {
  useBoardMount,
  useMountSheetAction,
} from "@/features/actor/api/use-mounts";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { NativeSelect } from "@/shared/ui/native-select";

type MountSheetControlsProps = {
  characterId: string;
  actorId: string;
  templateSlug: string | null;
  boarded: boolean;
  live: ActorLiveState | undefined;
  showDismount?: boolean;
};

export function MountSheetControls({
  characterId,
  actorId,
  templateSlug,
  boarded,
  live,
  showDismount = true,
}: MountSheetControlsProps) {
  const action = useMountSheetAction(characterId);
  const board = useBoardMount(characterId);
  const [healAmount, setHealAmount] = useState(
    String(MOUNT_HEALING_TOUCH_MIN_AMOUNT),
  );
  const [healTarget, setHealTarget] = useState<MountSheetHealTarget>("rider");
  const pending = action.isPending || board.isPending;
  const uses = live?.innateSpellUses;
  const showHeal = isCelestialSteedTemplate(templateSlug);
  const showFey = isFeySteedTemplate(templateSlug);
  const showFrighten = isFiendSteedTemplate(templateSlug);
  const parsedAmount = Number.parseInt(healAmount, 10);
  const healReady =
    Number.isInteger(parsedAmount) &&
    parsedAmount >= MOUNT_HEALING_TOUCH_MIN_AMOUNT;

  return (
    <div className="space-y-3 rounded-md border border-border/60 p-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Montaria
      </p>
      {showHeal ? (
        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Toque Curativo (PV)</span>
            <Input
              id={`mount-heal-amount-${actorId}`}
              type="number"
              min={MOUNT_HEALING_TOUCH_MIN_AMOUNT}
              step={1}
              value={healAmount}
              disabled={pending}
              onChange={(event) => setHealAmount(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Alvo</span>
            <NativeSelect
              value={healTarget}
              disabled={pending}
              onChange={(event) =>
                setHealTarget(
                  event.target.value === "mount" ? "mount" : "rider",
                )
              }
            >
              <option value="rider">Cavaleiro</option>
              <option value="mount">Montaria</option>
            </NativeSelect>
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={
              pending ||
              !healReady ||
              mountLongRestUseSpent(uses, MOUNT_LONG_REST_USE_KEY.healingTouch)
            }
            onClick={() =>
              action.mutate({
                action: "healing-touch",
                actorId,
                amount: parsedAmount,
                target: healTarget,
              })
            }
          >
            Toque Curativo
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {showFey ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={
              pending ||
              !boarded ||
              mountLongRestUseSpent(uses, MOUNT_LONG_REST_USE_KEY.feyStep)
            }
            onClick={() =>
              action.mutate({
                action: "fey-step",
                actorId,
              })
            }
          >
            Passo Feérico
          </Button>
        ) : null}
        {showFrighten ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={
              pending ||
              mountLongRestUseSpent(uses, MOUNT_LONG_REST_USE_KEY.frighten)
            }
            onClick={() =>
              action.mutate({
                action: "frighten",
                actorId,
              })
            }
          >
            Derrubar Brilho
          </Button>
        ) : null}
        {!boarded ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => board.mutate(actorId)}
          >
            Montar
          </Button>
        ) : null}
        {boarded && showDismount ? (
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
            Desmontar
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
            : "Falha na ação da montaria"}
        </p>
      ) : null}
      {board.isError ? (
        <p className="text-xs text-destructive" role="alert">
          {board.error instanceof Error
            ? board.error.message
            : "Falha ao montar"}
        </p>
      ) : null}
    </div>
  );
}
