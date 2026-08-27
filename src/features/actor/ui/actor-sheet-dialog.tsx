"use client";

import {
  ACTOR_KIND_LABELS,
} from "@/entities/actor/types";
import { useActorDetail } from "@/features/actor/api/use-actors";
import { ActorSheetBody } from "@/features/actor/ui/actor-sheet-body";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type ActorSheetDialogProps = {
  actorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Ficha de veículo/companheiro em modal sobre a ficha do personagem. */
export function ActorSheetDialog({
  actorId,
  open,
  onOpenChange,
}: ActorSheetDialogProps) {
  const query = useActorDetail(actorId ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(94vh,52rem)] w-full flex-col gap-3 overflow-hidden p-4 sm:max-w-3xl">
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>
            {query.data?.name ?? "Ficha"}
          </DialogTitle>
          <DialogDescription>
            {query.data
              ? `${ACTOR_KIND_LABELS[query.data.actorKind]} — PV, ações e estado de mesa`
              : "Carregando ficha do veículo ou companheiro"}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {!actorId ? null : query.isPending ? (
            <p className="text-sm text-muted-foreground">Carregando ficha…</p>
          ) : query.isError || !query.data ? (
            <p className="text-sm text-destructive">Ficha não encontrada.</p>
          ) : (
            <ActorSheetBody actor={query.data} hideParentLink />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
