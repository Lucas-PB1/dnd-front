"use client";

import { FormEvent, useMemo, useState } from "react";

import type { AddCreaturePayload } from "@/features/campaign/campaigns/api/encounters.api";
import { useAddEncounterCreature } from "@/features/campaign/campaigns/api/use-encounters";
import { useCreatureTemplatesCatalog } from "@/features/catalog/creature-template-catalog/api/use-creature-templates";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { cn } from "@/shared/lib/utils";

type Props = {
  campaignId: string;
  encounterId: string;
  busy: boolean;
};

type AddMode = "catalog" | "manual";

export function EncounterAddCreaturePanel({
  campaignId,
  encounterId,
  busy,
}: Props) {
  const addCreature = useAddEncounterCreature(campaignId);
  const catalog = useCreatureTemplatesCatalog();
  const [mode, setMode] = useState<AddMode>("catalog");
  const [templateSlug, setTemplateSlug] = useState("");
  const [count, setCount] = useState("1");
  const [alias, setAlias] = useState("");
  const [creatureName, setCreatureName] = useState("");
  const [hpMax, setHpMax] = useState("10");
  const [armorClass, setArmorClass] = useState("13");
  const [initMod, setInitMod] = useState("0");

  const templateOptions = useMemo(
    () =>
      (catalog.data ?? []).map((row) => ({
        value: row.slug,
        label: `${row.name}${row.challengeRating ? ` · ND ${row.challengeRating}` : ""}`,
        keywords: [row.slug, row.creatureType],
      })),
    [catalog.data],
  );

  const selectedTemplate = (catalog.data ?? []).find(
    (row) => row.slug === templateSlug,
  );

  function resetCatalogForm() {
    setAlias("");
    setCount("1");
  }

  function onAddFromCatalog(event: FormEvent) {
    event.preventDefault();
    if (!templateSlug) return;
    const payload: AddCreaturePayload = {
      templateSlug,
      count: Math.max(1, Number.parseInt(count, 10) || 1),
      name: alias.trim() || undefined,
    };
    addCreature.mutate(
      { encounterId, payload },
      { onSuccess: () => resetCatalogForm() },
    );
  }

  function onAddManual(event: FormEvent) {
    event.preventDefault();
    const max = Number(hpMax);
    const ac = Number(armorClass);
    const mod = Number(initMod);
    if (!creatureName.trim() || !Number.isFinite(max) || max < 1) return;
    if (!Number.isFinite(ac) || ac < 1) return;
    addCreature.mutate(
      {
        encounterId,
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

  const pending = busy || addCreature.isPending || catalog.isPending;

  return (
    <div className="space-y-2 border-t border-border/60 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-[0.7rem] font-semibold tracking-[0.08em] text-secondary uppercase">
          Adicionar criatura
        </p>
        <div className="flex gap-1">
          {(["catalog", "manual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "rounded-md border px-2 py-0.5 text-[0.7rem] font-medium transition-colors",
                mode === option
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
              )}
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              {option === "catalog" ? "Catálogo" : "Manual"}
            </button>
          ))}
        </div>
      </div>

      {mode === "catalog" ? (
        <form onSubmit={onAddFromCatalog} className="space-y-2">
          <SearchableSelect
            className="h-9 w-full text-sm"
            value={templateSlug}
            disabled={pending}
            placeholder={catalog.isPending ? "Carregando…" : "Buscar monstro…"}
            options={templateOptions}
            onValueChange={setTemplateSlug}
          />
          {selectedTemplate ? (
            <p className="text-[0.7rem] text-muted-foreground">
              CA {selectedTemplate.armorClass ?? "—"} · PV{" "}
              {selectedTemplate.hitPointsAvg ?? "—"}
              {selectedTemplate.creatureType
                ? ` · ${selectedTemplate.creatureType}`
                : ""}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-[5rem_1fr_auto]">
            <Input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              aria-label="Quantidade"
              disabled={pending}
            />
            <Input
              placeholder="Apelido opcional"
              value={alias}
              onChange={(event) => setAlias(event.target.value)}
              maxLength={120}
              aria-label="Apelido"
              disabled={pending}
            />
            <Button type="submit" size="sm" disabled={pending || !templateSlug}>
              Adicionar
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={onAddManual}
          className="grid gap-2 sm:grid-cols-[1fr_5rem_5rem_5rem_auto]"
        >
          <Input
            placeholder="Nome"
            value={creatureName}
            onChange={(e) => setCreatureName(e.target.value)}
            maxLength={120}
            required
            aria-label="Nome da criatura"
            disabled={pending}
          />
          <Input
            type="number"
            min={1}
            placeholder="PV máx"
            value={hpMax}
            onChange={(e) => setHpMax(e.target.value)}
            required
            aria-label="PV máximo"
            disabled={pending}
          />
          <Input
            type="number"
            min={1}
            placeholder="CA"
            value={armorClass}
            onChange={(e) => setArmorClass(e.target.value)}
            required
            aria-label="Classe de armadura"
            disabled={pending}
          />
          <Input
            type="number"
            placeholder="Init"
            value={initMod}
            onChange={(e) => setInitMod(e.target.value)}
            aria-label="Modificador de iniciativa"
            disabled={pending}
          />
          <Button
            type="submit"
            size="sm"
            disabled={pending || !creatureName.trim()}
          >
            Adicionar
          </Button>
        </form>
      )}
    </div>
  );
}
