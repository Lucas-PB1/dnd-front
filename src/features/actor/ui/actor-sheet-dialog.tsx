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
      <DialogContent
        className="flex h-[min(100dvh,100%)] max-h-[min(100dvh,100%)] w-full max-w-[calc(100%-0.5rem)] flex-col gap-2 overflow-hidden rounded-t-2xl rounded-b-xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:h-auto sm:max-h-[min(94vh,52rem)] sm:max-w-3xl sm:gap-3 sm:rounded-xl sm:p-4"
        viewportClassName="items-end justify-end p-1 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-center sm:p-4"
      >
        <DialogHeader className="shrink-0 space-y-1 pr-10">
          <DialogTitle className="text-base sm:text-lg">
            {query.data?.name ?? "Ficha"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {query.data
              ? `${ACTOR_KIND_LABELS[query.data.actorKind]} — PV, ações e estado de mesa`
              : "Carregando ficha do veículo ou companheiro"}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
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
