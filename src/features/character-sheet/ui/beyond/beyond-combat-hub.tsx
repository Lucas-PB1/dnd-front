"use client";

import {
  BoltIcon,
  HeartIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import {
  abilityModifierValue,
  formatSkillBonus,
  initiativeBonus,
} from "@/entities/character";
import {
  useCharacterState,
  usePatchCharacterState,
  useSpendClassResource,
} from "@/features/character-sheet/api/use-character-state";
import { CombatMetric } from "@/features/character-sheet/ui/beyond/combat-metric";
import { CombatStatusEditor } from "@/features/character-sheet/ui/beyond/combat-status-editor";
import { DeathSaveTrack } from "@/features/character-sheet/ui/beyond/death-save-track";
import { useSheetRolls } from "@/features/character-sheet/ui/beyond/sheet-rolls";
import { SheetChip } from "@/features/character-sheet/ui/sheet-ui";
import { useConditions } from "@/features/reference-catalog/api/use-reference";
import { Button } from "@/shared/ui/button";

type BeyondCombatHubProps = {
  characterId: string;
  character: CharacterDetail;
};

export function BeyondCombatHub({
  characterId,
  character,
}: BeyondCombatHubProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const spendResource = useSpendClassResource(characterId);
  const conditionsCatalog = useConditions();
  const rolls = useSheetRolls();

  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [tempHpDraft, setTempHpDraft] = useState("");
  const [inspirationDraft, setInspirationDraft] = useState(false);
  const [deathSuccessDraft, setDeathSuccessDraft] = useState(0);
  const [deathFailDraft, setDeathFailDraft] = useState(0);

  const state = stateQuery.data;
  const classResources = state?.classResources ?? [];
  const initiative = initiativeBonus(
    abilityModifierValue(character.abilityScores.destreza),
    character.proficiencyBonus,
    character.characterFeats,
  );

  const conditionNameBySlug = useMemo(() => {
    const names = new Map<string, string>();
    for (const condition of conditionsCatalog.data ?? []) {
      names.set(condition.slug, condition.name);
    }
    return names;
  }, [conditionsCatalog.data]);

  function openStatusEditor() {
    setSelectedConditions([...(state?.conditions ?? [])]);
    setTempHpDraft(String(state?.tempHp ?? 0));
    setInspirationDraft(state?.inspiration ?? false);
    setDeathSuccessDraft(state?.deathSaveSuccesses ?? 0);
    setDeathFailDraft(state?.deathSaveFailures ?? 0);
    setEditingStatus(true);
  }

  function toggleCondition(slug: string) {
    setSelectedConditions((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  async function saveStatus() {
    await patchState.mutateAsync({
      conditions: selectedConditions,
      tempHp: Number(tempHpDraft) || 0,
      inspiration: inspirationDraft,
      deathSaveSuccesses: deathSuccessDraft,
      deathSaveFailures: deathFailDraft,
    });
    setEditingStatus(false);
  }

  async function patchDeathOrInspiration(
    patch: Parameters<typeof patchState.mutateAsync>[0],
  ) {
    await patchState.mutateAsync(patch);
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-2.5">
      <div className="grid gap-2 sm:grid-cols-[6rem_7rem_minmax(10rem,1fr)_minmax(12rem,1.35fr)]">
        <CombatMetric
          label="Iniciativa"
          value={formatSkillBonus(initiative)}
          icon={BoltIcon}
          onClick={() => rolls.initiative.mutate({})}
          disabled={rolls.initiative.isPending}
        />
        <CombatMetric
          label="CA"
          value={character.armorClass}
          hint={character.armorClassNote}
          icon={ShieldCheckIcon}
          emphasize
        />

        <div className="min-w-0 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
          <p className="inline-flex items-center gap-1 text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            <ShieldCheckIcon className="size-3 text-secondary" aria-hidden />
            Defesas
          </p>
          <p className="mt-1 truncate text-sm">
            {character.armorClassNote || "Nenhuma defesa adicional"}
          </p>
        </div>

        <div className="min-w-0 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1 text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              <HeartIcon className="size-3 text-secondary" aria-hidden />
              Condições
            </p>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="gap-1"
              disabled={!state}
              onClick={openStatusEditor}
            >
              <PencilSquareIcon className="size-3" aria-hidden />
              Editar
            </Button>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap gap-1">
            {state?.conditions?.length ? (
              state.conditions.map((slug) => (
                <SheetChip key={slug} active>
                  {conditionNameBySlug.get(slug) ?? slug}
                </SheetChip>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Nenhuma</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card/70 px-3 py-2">
          <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Inspiração
          </p>
          <Button
            type="button"
            size="sm"
            variant={state?.inspiration ? "default" : "outline"}
            className="mt-2"
            disabled={!state || patchState.isPending}
            onClick={() =>
              patchDeathOrInspiration({
                inspiration: !(state?.inspiration ?? false),
              })
            }
          >
            {state?.inspiration ? "Ativa" : "Inativa"}
          </Button>
        </div>
        <DeathSaveTrack
          label="Sucessos (morte)"
          value={state?.deathSaveSuccesses ?? 0}
          disabled={!state || patchState.isPending}
          onChange={(deathSaveSuccesses) =>
            patchDeathOrInspiration({ deathSaveSuccesses })
          }
        />
        <DeathSaveTrack
          label="Falhas (morte)"
          value={state?.deathSaveFailures ?? 0}
          tone="danger"
          disabled={!state || patchState.isPending}
          onChange={(deathSaveFailures) =>
            patchDeathOrInspiration({ deathSaveFailures })
          }
        />
      </div>

      {classResources.length > 0 ? (
        <div className="mt-2 rounded-lg border border-border/70 bg-card/70 px-3 py-2">
          <p className="text-[0.58rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Recursos de classe
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {classResources.map((resource) => (
              <div
                key={resource.slug}
                className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-background/60 px-2 py-1"
              >
                <span className="text-sm">
                  {resource.name}{" "}
                  <span className="tabular-nums text-muted-foreground">
                    {resource.remaining}/{resource.max}
                    {resource.dieLabel ? ` · ${resource.dieLabel}` : ""}
                  </span>
                </span>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={
                    resource.remaining <= 0 || spendResource.isPending
                  }
                  onClick={() =>
                    spendResource.mutate({ resourceSlug: resource.slug })
                  }
                >
                  Usar
                </Button>
              </div>
            ))}
          </div>
          {spendResource.isError ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {spendResource.error instanceof Error
                ? spendResource.error.message
                : "Não foi possível gastar o recurso"}
            </p>
          ) : null}
        </div>
      ) : null}

      {editingStatus ? (
        <CombatStatusEditor
          conditions={conditionsCatalog.data ?? []}
          conditionsLoading={conditionsCatalog.isPending}
          selectedConditions={selectedConditions}
          tempHpDraft={tempHpDraft}
          inspirationDraft={inspirationDraft}
          deathSuccessDraft={deathSuccessDraft}
          deathFailDraft={deathFailDraft}
          isPending={patchState.isPending}
          onToggleCondition={toggleCondition}
          onTempHpChange={setTempHpDraft}
          onInspirationChange={setInspirationDraft}
          onDeathSuccessChange={setDeathSuccessDraft}
          onDeathFailChange={setDeathFailDraft}
          onSave={saveStatus}
          onCancel={() => setEditingStatus(false)}
        />
      ) : null}

      {patchState.isError ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {patchState.error instanceof Error
            ? patchState.error.message
            : "Não foi possível atualizar as condições"}
        </p>
      ) : null}

      {character.equipmentWarnings?.length ||
      (character.speedPenaltyMeters ?? 0) > 0 ||
      character.cannotCastSpellsInArmor ? (
        <ul className="mt-2 space-y-1 rounded-lg border border-secondary/35 bg-secondary/5 px-3 py-2 text-xs text-secondary">
          {(character.equipmentWarnings ?? []).map((warning) => (
            <li key={`${warning.code}-${warning.itemSlug ?? warning.message}`}>
              {warning.message}
            </li>
          ))}
          {(character.speedPenaltyMeters ?? 0) > 0 &&
          !(character.equipmentWarnings ?? []).some(
            (w) => w.code === "strength_requirement",
          ) ? (
            <li>
              Deslocamento −{character.speedPenaltyMeters} m (Força insuficiente).
            </li>
          ) : null}
          {character.cannotCastSpellsInArmor &&
          !(character.equipmentWarnings ?? []).some(
            (w) => w.code === "lacks_armor_training",
          ) ? (
            <li>Não pode conjurar com armadura/escudo sem treino.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
