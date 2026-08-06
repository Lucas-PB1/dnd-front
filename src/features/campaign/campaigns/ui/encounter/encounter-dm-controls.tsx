"use client";

import { FormEvent, useState } from "react";

import type {
  AdvantageMode,
  CampaignEncounter,
} from "@/features/campaign/campaigns/api/encounters.api";
import {
  useAddEncounterCreature,
  useCloseEncounter,
  useNextEncounterTurn,
  usePatchEncounter,
  useRollAllInitiative,
} from "@/features/campaign/campaigns/api/use-encounters";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
  const addCreature = useAddEncounterCreature(campaignId);

  const [creatureName, setCreatureName] = useState("");
  const [hpMax, setHpMax] = useState("10");
  const [armorClass, setArmorClass] = useState("13");
  const [initMod, setInitMod] = useState("0");

  function onAddCreature(event: FormEvent) {
    event.preventDefault();
    const max = Number(hpMax);
    const ac = Number(armorClass);
    const mod = Number(initMod);
    if (!creatureName.trim() || !Number.isFinite(max) || max < 1) return;
    if (!Number.isFinite(ac) || ac < 1) return;
    addCreature.mutate(
      {
        encounterId: encounter.id,
        payload: {
          name: creatureName.trim(),
          hpMax: max,
          armorClass: ac,
          initiativeModifier: Number.isFinite(mod) ? mod : 0,
        },
      },
      { onSuccess: () => setCreatureName("") },
    );
  }

  const busy =
    patch.isPending ||
    rollAll.isPending ||
    nextTurn.isPending ||
    close.isPending ||
    addCreature.isPending;

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          Iniciativa
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
          Rolar todas as iniciativas
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

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
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
          PV criaturas
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

      <form
        onSubmit={onAddCreature}
        className="grid gap-2 sm:grid-cols-[1fr_5rem_5rem_5rem_auto]"
      >
        <Input
          placeholder="Nome da criatura"
          value={creatureName}
          onChange={(e) => setCreatureName(e.target.value)}
          maxLength={120}
          required
        />
        <Input
          type="number"
          min={1}
          placeholder="PV máx"
          value={hpMax}
          onChange={(e) => setHpMax(e.target.value)}
          required
        />
        <Input
          type="number"
          min={1}
          placeholder="CA"
          value={armorClass}
          onChange={(e) => setArmorClass(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Init"
          value={initMod}
          onChange={(e) => setInitMod(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={busy || !creatureName.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
