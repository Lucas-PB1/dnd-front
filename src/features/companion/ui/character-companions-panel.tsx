"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import type { CompanionTracker } from "@/entities/companion/types";
import { ActorSheetDialog } from "@/features/actor/ui/actor-sheet-dialog";
import { useCharacterState } from "@/features/character/character-sheet/api/use-character-state";
import { BeyondPanel } from "@/features/character/character-sheet/ui/beyond/layout/beyond-panel";
import {
  useCharacterCompanions,
  useDismissCharacterCompanion,
} from "@/features/companion/api/use-character-companions";
import { useSyncCharacterCompanion } from "@/features/companion/api/use-companion-sync";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CharacterCompanionsPanelProps = {
  characterId: string;
};

function hpLabel(companion: CompanionTracker): string | null {
  if (companion.hitPointsCurrent == null || companion.hitPointsMax == null) {
    return null;
  }
  return `${companion.hitPointsCurrent}/${companion.hitPointsMax} PV`;
}

function CompanionRow({
  companion,
  isPending,
  onOpenSheet,
  onDismiss,
}: {
  companion: CompanionTracker;
  isPending: boolean;
  onOpenSheet: (actorId: string) => void;
  onDismiss: (actorId: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const hp = hpLabel(companion);

  return (
    <li className="rounded-md border border-border/50 px-2 py-2">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className={cn(
            "min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline",
            companion.defeated && "text-destructive",
          )}
          onClick={() => onOpenSheet(companion.actorId)}
        >
          {companion.name}
        </button>
        <span className="shrink-0 text-xs text-muted-foreground">
          {hp ?? (companion.armorClass != null ? `CA ${companion.armorClass}` : "")}
          {companion.defeated ? " · derrotado" : ""}
        </span>
      </div>
      {companion.conditions.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Condições: {companion.conditions.join(", ")}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Link
          href={`/actors/${companion.actorId}`}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Abrir ficha
        </Link>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={() => onOpenSheet(companion.actorId)}
        >
          Ficha
        </Button>
        {confirming ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              disabled={isPending}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 px-2 text-xs"
              disabled={isPending}
              onClick={() => onDismiss(companion.actorId)}
            >
              Confirmar
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs text-destructive"
            disabled={isPending}
            onClick={() => setConfirming(true)}
          >
            Dispensar
          </Button>
        )}
      </div>
    </li>
  );
}

export function CharacterCompanionsPanel({
  characterId,
}: CharacterCompanionsPanelProps) {
  const pathname = usePathname();
  const query = useCharacterCompanions(characterId);
  const stateQuery = useCharacterState(characterId);
  const sync = useSyncCharacterCompanion(characterId, pathname || "/characters");
  const dismiss = useDismissCharacterCompanion(characterId);
  const [sheetActorId, setSheetActorId] = useState<string | null>(null);

  const companions =
    query.data && query.data.length > 0
      ? query.data
      : (stateQuery.data?.companions ?? []);

  if (companions.length === 0) return null;

  const isPending = sync.isPending || dismiss.isPending;

  return (
    <>
      <BeyondPanel title="Companheiros" icon={UserGroupIcon}>
        <ul className="space-y-2">
          {companions.map((companion) => (
            <CompanionRow
              key={companion.actorId}
              companion={companion}
              isPending={isPending}
              onOpenSheet={setSheetActorId}
              onDismiss={(actorId) => dismiss.mutate({ actorId })}
            />
          ))}
        </ul>
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => sync.mutate(false)}
          >
            Sincronizar
          </Button>
        </div>
        {sync.isError ? (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {sync.error instanceof Error
              ? sync.error.message
              : "Falha ao sincronizar"}
          </p>
        ) : null}
        {dismiss.isError ? (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {dismiss.error instanceof Error
              ? dismiss.error.message
              : "Falha ao dispensar"}
          </p>
        ) : null}
      </BeyondPanel>
      <ActorSheetDialog
        actorId={sheetActorId}
        open={sheetActorId != null}
        onOpenChange={(open) => {
          if (!open) setSheetActorId(null);
        }}
      />
    </>
  );
}
