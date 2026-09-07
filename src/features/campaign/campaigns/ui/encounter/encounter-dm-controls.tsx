"use client";

import type {
  AdvantageMode,
  CampaignEncounter,
} from "@/features/campaign/campaigns/api/encounters.api";
import {
  useCloseEncounter,
  useNextEncounterTurn,
  usePatchEncounter,
  useRollAllInitiative,
} from "@/features/campaign/campaigns/api/use-encounters";
import { EncounterAddCreaturePanel } from "@/features/campaign/campaigns/ui/encounter/encounter-add-creature-panel";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type Props = {
  campaignId: string;
  encounter: CampaignEncounter;
  advantage: AdvantageMode;
  onAdvantageChange: (mode: AdvantageMode) => void;
};

export function EncounterDmControls({
  campaignId,
  encounter,
  advantage,
  onAdvantageChange,
}: Props) {
  const patch = usePatchEncounter(campaignId);
  const rollAll = useRollAllInitiative(campaignId);
  const nextTurn = useNextEncounterTurn(campaignId);
  const close = useCloseEncounter(campaignId);

  const busy =
    patch.isPending ||
    rollAll.isPending ||
    nextTurn.isPending ||
    close.isPending;

  return (
    <div
      className={cn(
        "sticky top-2 z-20 space-y-3 rounded-xl border border-border/80 bg-background/90 p-3 shadow-sm backdrop-blur-md sm:p-4",
      )}
    >
      <div className="space-y-2">
        <p className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-secondary uppercase">
          Mesa
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Iniciativa</span>
            <SearchableSelect
              className="h-8 w-auto min-w-[8rem] text-sm"
              value={advantage}
              disabled={busy}
              options={[
                { value: "normal", label: "Normal" },
                { value: "advantage", label: "Vantagem" },
                { value: "disadvantage", label: "Desvantagem" },
              ]}
              onValueChange={(next) =>
                onAdvantageChange(next as AdvantageMode)
              }
            />
          </label>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => nextTurn.mutate(encounter.id)}
          >
            Próximo turno
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              rollAll.mutate({
                encounterId: encounter.id,
                advantage:
                  advantage === "normal" ? undefined : advantage,
              })
            }
          >
            Rolar todas
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => {
              if (window.confirm("Encerrar este encontro?")) {
                close.mutate(encounter.id);
              }
            }}
          >
            Encerrar
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-secondary uppercase">
          Visibilidade
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-[var(--secondary)]"
              checked={encounter.playersCanView}
              disabled={busy}
              onChange={(e) =>
                patch.mutate({
                  encounterId: encounter.id,
                  payload: { playersCanView: e.target.checked },
                })
              }
            />
            Jogadores podem ver
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">PV criaturas</span>
            <SearchableSelect
              className="h-8 w-auto min-w-[8rem] text-sm"
              value={encounter.creatureHpVisibility}
              disabled={busy}
              options={[
                { value: "percent", label: "Percentual" },
                { value: "hidden", label: "Oculto" },
                { value: "exact", label: "Exato" },
              ]}
              onValueChange={(next) =>
                patch.mutate({
                  encounterId: encounter.id,
                  payload: {
                    creatureHpVisibility: next as
                      | "hidden"
                      | "percent"
                      | "exact",
                  },
                })
              }
            />
          </label>
        </div>
      </div>

      <EncounterAddCreaturePanel
        campaignId={campaignId}
        encounterId={encounter.id}
        busy={busy}
      />
    </div>
  );
}
