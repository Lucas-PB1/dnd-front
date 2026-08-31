"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import type { SubclassOptionPick } from "@/entities/companion/lib/companion-profiles";
import { COMPANION_COMMANDS } from "@/entities/companion/lib/companion-commands";
import type { CompanionCommandSlug } from "@/features/character/character-sheet/api/character-session.api";
import {
  findCompanionProfile,
  resolveCompanionConfig,
} from "@/entities/companion/lib/companion-profiles";
import {
  pickCompanionActor,
  useSyncCharacterCompanion,
} from "@/features/companion/api/use-companion-sync";
import { useCharacterActors } from "@/features/actor/api/use-actors";
import { ActorSheetDialog } from "@/features/actor/ui/actor-sheet-dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CompanionTrackerPanelProps = {
  characterId: string;
  subclassSlug: string | null | undefined;
  subclassOptions: readonly SubclassOptionPick[];
  level: number;
  isTableActionPending?: boolean;
  onCommand: (command: CompanionCommandSlug) => void;
  lastNote?: string | null;
};

export function CompanionTrackerPanel({
  characterId,
  subclassSlug,
  subclassOptions,
  level,
  isTableActionPending = false,
  onCommand,
  lastNote,
}: CompanionTrackerPanelProps) {
  const pathname = usePathname();
  const profile = findCompanionProfile(subclassSlug);
  const config = useMemo(
    () => resolveCompanionConfig(subclassSlug, subclassOptions),
    [subclassSlug, subclassOptions],
  );
  const actors = useCharacterActors(characterId);
  const sync = useSyncCharacterCompanion(characterId, pathname || "/characters");
  const [sheetActorId, setSheetActorId] = useState<string | null>(null);

  if (!profile || level < profile.minLevel) return null;

  const companion = pickCompanionActor(actors.data, config?.templateSlug ?? null);
  const hp =
    companion?.hitPointsCurrent != null && companion?.hitPointsMax != null
      ? `${companion.hitPointsCurrent}/${companion.hitPointsMax} PV`
      : null;
  const defeated =
    companion?.hitPointsCurrent != null && companion.hitPointsCurrent <= 0;
  const isPending = sync.isPending || isTableActionPending || actors.isPending;

  return (
    <div className="space-y-2 rounded-md border border-border/60 p-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Companheiro Primal</p>
          <p className="text-xs text-muted-foreground">
            {config?.variantLabel ?? "Complete as escolhas na ficha"}
          </p>
        </div>
        {companion ? (
          <button
            type="button"
            className={cn(
              "text-right text-xs hover:underline",
              defeated ? "text-destructive" : "text-muted-foreground",
            )}
            onClick={() => setSheetActorId(companion.id)}
          >
            {companion.name}
            {hp ? ` · ${hp}` : ""}
            {defeated ? " · derrotado" : ""}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isPending || !config}
          onClick={() => sync.mutate(false)}
        >
          {companion ? "Sincronizar" : "Invocar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending || !config}
          onClick={() => sync.mutate(true)}
        >
          Restaurar PV
        </Button>
        {companion ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => setSheetActorId(companion.id)}
          >
            Ficha
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {COMPANION_COMMANDS.map((command) => (
          <Button
            key={command.slug}
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={isPending || !companion}
            onClick={() => onCommand(command.slug as CompanionCommandSlug)}
          >
            {command.label}
          </Button>
        ))}
      </div>

      {sync.error ? (
        <p className="text-xs text-destructive">{sync.error.message}</p>
      ) : null}
      {lastNote ? (
        <p className="text-xs text-muted-foreground">{lastNote}</p>
      ) : null}

      <ActorSheetDialog
        actorId={sheetActorId}
        open={sheetActorId != null}
        onOpenChange={(open) => {
          if (!open) setSheetActorId(null);
        }}
      />
    </div>
  );
}
