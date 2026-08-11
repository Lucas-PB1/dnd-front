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
  sheetAbilityScores,
} from "@/entities/character";
import {
  useCharacterState,
  usePatchCharacterState,
} from "@/features/character/character-sheet/api/use-character-state";
import { CombatStatusEditor } from "@/features/character/character-sheet/ui/beyond/combat/status/status-editor";
import { useSheetRolls } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { SheetChip } from "@/features/character/character-sheet/ui/sheet/sheet-ui";
import { useConditions } from "@/features/catalog/reference-catalog/api/use-reference";
import { useSpeciesDetail } from "@/features/catalog/species-catalog/api/use-species";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type SheetCombatStripProps = {
  characterId: string;
  character: CharacterDetail;
};

type MetricProps = {
  label: string;
  value: string | number;
  hint?: string;
  emphasize?: boolean;
  icon?: typeof BoltIcon;
  onClick?: () => void;
  disabled?: boolean;
};

const metricShellClass = cn(
  "flex h-full min-h-[4.25rem] flex-col items-center justify-center rounded-lg border px-2.5 py-2 text-center",
);

function HeaderMetric({
  label,
  value,
  hint,
  emphasize,
  icon: Icon,
  onClick,
  disabled,
}: MetricProps) {
  const className = cn(
    metricShellClass,
    emphasize
      ? "border-secondary/50 bg-secondary/12"
      : "border-border/65 bg-background/40",
    onClick &&
      "cursor-pointer transition-colors hover:border-secondary/55 disabled:pointer-events-none disabled:opacity-60",
  );

  const body = (
    <>
      <span className="inline-flex items-center gap-1 text-[0.55rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3 text-secondary" aria-hidden /> : null}
        {label}
      </span>
      <span className="font-heading mt-0.5 text-lg font-semibold leading-none tabular-nums">
        {value}
      </span>
      {hint ? (
        <span
          className="mt-0.5 line-clamp-2 w-full text-[0.6rem] leading-snug text-muted-foreground"
          title={hint}
        >
          {hint}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        disabled={disabled}
        title={hint ? `${label}: ${hint}` : `Rolar ${label.toLowerCase()}`}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={className} title={hint || undefined}>
      {body}
    </div>
  );
}

/**
 * Faixa compacta no header: Iniciativa, CA, Deslocamento e Condições.
 */
export function SheetCombatStrip({
  characterId,
  character,
}: SheetCombatStripProps) {
  const stateQuery = useCharacterState(characterId);
  const patchState = usePatchCharacterState(characterId);
  const conditionsCatalog = useConditions();
  const speciesDetail = useSpeciesDetail(character.speciesSlug, true);
  const rolls = useSheetRolls();

  const [editing, setEditing] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [tempHpDraft, setTempHpDraft] = useState("");

  const state = stateQuery.data;
  const initiative = initiativeBonus(
    abilityModifierValue(sheetAbilityScores(character).destreza),
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

  const speedLabel = speciesDetail.data?.speed ?? "—";
  const speedHint =
    (character.speedPenaltyMeters ?? 0) > 0
      ? `−${character.speedPenaltyMeters} m`
      : (character.itemSpeedBonusMeters ?? 0) > 0
        ? `+${character.itemSpeedBonusMeters} m`
        : undefined;

  const conditions = state?.conditions ?? [];

  function openEditor() {
    setSelectedConditions([...conditions]);
    setTempHpDraft(String(state?.tempHp ?? 0));
    setEditing(true);
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
    });
    setEditing(false);
  }

  return (
    <>
      <div className="grid grid-cols-2 items-stretch gap-1.5 sm:grid-cols-4">
        <HeaderMetric
          label="Inic."
          value={formatSkillBonus(initiative)}
          icon={BoltIcon}
          onClick={() => rolls.initiative.mutate({})}
          disabled={rolls.initiative.isPending}
        />
        <HeaderMetric
          label="CA"
          value={character.armorClass}
          hint={character.armorClassNote}
          icon={ShieldCheckIcon}
          emphasize
        />
        <HeaderMetric
          label="Desloc."
          value={speedLabel}
          hint={speedHint}
        />

        <div
          className={cn(
            metricShellClass,
            "items-stretch justify-start border-border/65 bg-background/40 text-left",
          )}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1 text-[0.55rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              <HeartIcon className="size-3 text-rose-500" aria-hidden />
              Condições
            </span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="h-5 gap-1 px-1.5 text-[0.65rem]"
              disabled={!state}
              onClick={openEditor}
            >
              <PencilSquareIcon className="size-3" aria-hidden />
              Editar
            </Button>
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap gap-1">
            {conditions.length > 0 ? (
              conditions.map((slug) => (
                <SheetChip key={slug} active>
                  {conditionNameBySlug.get(slug) ?? slug}
                </SheetChip>
              ))
            ) : (
              <span className="text-[0.7rem] text-muted-foreground italic">
                Nenhuma
              </span>
            )}
          </div>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Condições e PV temp.</DialogTitle>
            <DialogDescription>
              Marque condições ativas e PV temporários.
            </DialogDescription>
          </DialogHeader>
          <CombatStatusEditor
            conditions={conditionsCatalog.data ?? []}
            conditionsLoading={conditionsCatalog.isPending}
            selectedConditions={selectedConditions}
            tempHpDraft={tempHpDraft}
            isPending={patchState.isPending}
            onToggleCondition={toggleCondition}
            onTempHpChange={setTempHpDraft}
            onSave={saveStatus}
            onCancel={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
