"use client";

import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import type { CharacterSpell } from "@/entities/character/sheet-types";
import { formatSkillBonus } from "@/entities/character";
import type { AbilityScores } from "@/entities/character/types";
import type { CharacterState } from "@/entities/character/session-types";
import type { SpellSummary } from "@/entities/spell/types";
import { useAbilityLabels } from "@/features/catalog/reference-catalog/api/use-ability-labels";
import { Button } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { cn } from "@/shared/lib/utils";

export const SPELL_SLOT_LEVELS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;

const LIST_TYPE_LABELS: Record<CharacterSpell["listType"], string> = {
  known: "Conhecida",
  prepared: "Preparada",
  always_prepared: "Sempre preparada",
};

const WIZARD_LIST_TYPE_LABELS: Record<CharacterSpell["listType"], string> = {
  known: "Grimório",
  prepared: "Preparada hoje",
  always_prepared: "Sempre preparada",
};

export const MAGIC_MISSILE_SPELL_SLUG = "misseis-magicos";
export const MAGIC_MISSILE_FREE_RESOURCE = "magic-missile-free";

const SOURCE_LABELS: Record<NonNullable<CharacterSpell["source"]>, string> = {
  class: "Classe",
  subclass: "Subclasse",
  feat: "Talento",
  species: "Espécie",
};

export type SpellRowModel = {
  spell: CharacterSpell;
  detail: SpellSummary | undefined;
  level: number;
  name: string;
};

type BeyondSpellRowProps = {
  row: SpellRowModel;
  state: CharacterState | undefined;
  casting: boolean;
  cannotCastSpellsInArmor: boolean;
  spellSaveDc: number | null;
  spellAttackBonus: number | null;
  /** Labels de lista (mago: grimório vs preparadas). */
  wizardLayout?: boolean;
  /** Mago dos Mísseis: usos gratuitos restantes. */
  freeMissileUses?: number;
  /** Conjura sem gastar espaço (Dominância / Invocação free_cast à vontade). */
  isSpellMastery?: boolean;
  onCast: (
    spellSlug: string,
    options?: {
      slotLevel?: number;
      freeCastResourceSlug?: string;
      useFreeCast?: boolean;
    },
  ) => Promise<void>;
};

export function BeyondSpellRow({
  row,
  state,
  casting,
  cannotCastSpellsInArmor,
  spellSaveDc,
  spellAttackBonus,
  wizardLayout = false,
  freeMissileUses = 0,
  isSpellMastery = false,
  onCast,
}: BeyondSpellRowProps) {
  const { shortOf } = useAbilityLabels();
  const [open, setOpen] = useState(false);
  const [slotLevel, setSlotLevel] = useState<number | null>(null);

  const isCantrip = row.level === 0;
  const isUnknownLevel = row.level < 0;
  const baseLevel = Math.max(row.level, 1);

  const availableUpcastLevels = useMemo(() => {
    if (!state || isCantrip || isUnknownLevel) return [];
    return SPELL_SLOT_LEVELS.map(Number).filter((lv) => {
      if (lv < baseLevel) return false;
      return (state.spellSlotsRemaining[String(lv)] ?? 0) > 0;
    });
  }, [state, isCantrip, isUnknownLevel, baseLevel]);

  const selectedSlot =
    slotLevel ?? availableUpcastLevels[0] ?? (isCantrip ? undefined : baseLevel);

  const canFreeCastMissile =
    !cannotCastSpellsInArmor &&
    row.spell.spellSlug === MAGIC_MISSILE_SPELL_SLUG &&
    freeMissileUses > 0;

  const grantedCast = state?.grantedSpellCastOptions?.find(
    (option) => option.spellSlug === row.spell.spellSlug,
  );
  const oncePerFreeRemaining =
    grantedCast?.castEconomy === "once_per_long_rest"
      ? (grantedCast.freeCastsRemaining ?? 0)
      : 0;
  const canOncePerFreeCast =
    !cannotCastSpellsInArmor && !isSpellMastery && oncePerFreeRemaining > 0;

  const canCast =
    !cannotCastSpellsInArmor &&
    (isCantrip ||
      isSpellMastery ||
      canOncePerFreeCast ||
      (selectedSlot != null &&
        (state?.spellSlotsRemaining[String(selectedSlot)] ?? 0) > 0));

  const listLabel = wizardLayout
    ? WIZARD_LIST_TYPE_LABELS[row.spell.listType]
    : LIST_TYPE_LABELS[row.spell.listType];
  const sourceLabel = row.spell.source
    ? SOURCE_LABELS[row.spell.source]
    : undefined;
  const metaParts = [
    row.detail?.schoolName,
    wizardLayout ? null : listLabel,
    sourceLabel,
    row.detail?.castingTime,
  ].filter(Boolean);

  const saveAbility = row.detail?.saveAbilitySlug as
    | keyof AbilityScores
    | null
    | undefined;
  const saveBadge =
    saveAbility && spellSaveDc != null
      ? `CD ${spellSaveDc} · ${shortOf(saveAbility)}`
      : null;
  const attackBadge =
    row.detail?.requiresAttackRoll && spellAttackBonus != null
      ? `ataque ${formatSkillBonus(spellAttackBonus)}`
      : null;

  async function cast() {
    if (isCantrip || isSpellMastery) {
      await onCast(row.spell.spellSlug);
      return;
    }
    if (canOncePerFreeCast) {
      await onCast(row.spell.spellSlug, { useFreeCast: true });
      return;
    }
    if (selectedSlot == null) return;
    await onCast(row.spell.spellSlug, { slotLevel: selectedSlot });
  }

  async function castFreeMissile() {
    await onCast(row.spell.spellSlug, {
      freeCastResourceSlug: MAGIC_MISSILE_FREE_RESOURCE,
    });
  }

  return (
    <li>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <ChevronDownIcon
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {row.name}
              </span>
              {row.detail?.concentration ? (
                <span
                  className="rounded border border-primary/40 px-1 py-px text-[0.6rem] font-semibold tracking-wide text-primary uppercase"
                  title="Concentração"
                >
                  C
                </span>
              ) : null}
              {row.detail?.ritual ? (
                <span
                  className="rounded border border-border px-1 py-px text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase"
                  title="Ritual"
                >
                  R
                </span>
              ) : null}
              {isSpellMastery ? (
                <span
                  className="rounded border border-secondary/40 bg-secondary/10 px-1.5 py-px text-[0.6rem] font-semibold tracking-wide text-secondary uppercase"
                  title="Conjura sem gastar espaço de magia"
                >
                  À vontade
                </span>
              ) : null}
              {canOncePerFreeCast ? (
                <span
                  className="rounded border border-secondary/40 bg-secondary/10 px-1.5 py-px text-[0.6rem] font-semibold tracking-wide text-secondary uppercase"
                  title="1 uso gratuito por Descanso Longo"
                >
                  1×/DL
                </span>
              ) : null}
              {saveBadge ? (
                <span className="rounded border border-secondary/40 bg-secondary/10 px-1.5 py-px font-mono text-[0.65rem] tabular-nums text-secondary">
                  {saveBadge}
                </span>
              ) : null}
              {attackBadge ? (
                <span className="rounded border border-primary/35 bg-primary/8 px-1.5 py-px font-mono text-[0.65rem] tabular-nums text-primary">
                  {attackBadge}
                </span>
              ) : null}
            </span>
            {metaParts.length > 0 ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {metaParts.join(" · ")}
              </span>
            ) : null}
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {!isCantrip &&
          !isUnknownLevel &&
          !isSpellMastery &&
          availableUpcastLevels.length > 1 ? (
            <>
              <label
                className="sr-only"
                htmlFor={`slot-${row.spell.spellSlug}`}
              >
                Espaço
              </label>
              <SearchableSelect
                id={`slot-${row.spell.spellSlug}`}
                className="h-7 w-[4.5rem] text-xs"
                value={selectedSlot != null ? String(selectedSlot) : ""}
                disabled={casting || availableUpcastLevels.length === 0}
                options={availableUpcastLevels.map((lv) => ({
                  value: String(lv),
                  label: `${lv}º`,
                }))}
                onValueChange={(next) => setSlotLevel(Number(next))}
              />
            </>
          ) : null}

          {canFreeCastMissile ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={casting || isUnknownLevel}
              title="Conjura sem gastar espaço (uso gratuito da subclasse)"
              onClick={castFreeMissile}
            >
              Uso gratuito
            </Button>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-1"
            disabled={casting || !canCast || isUnknownLevel}
            title={
              cannotCastSpellsInArmor
                ? "Não pode conjurar com armadura/escudo sem treino"
                : isUnknownLevel
                  ? "Aguardando catálogo"
                  : isSpellMastery
                    ? "Sem espaço"
                    : canOncePerFreeCast
                      ? "Uso gratuito (1×/DL)"
                      : !canCast
                      ? "Sem espaços disponíveis"
                      : undefined
            }
            onClick={cast}
          >
            <SparklesIcon className="size-3.5" aria-hidden />
            Conjurar
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/40 bg-muted/15 px-3 py-3">
          {row.detail?.description ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {[
                  row.detail.range ? `Alcance ${row.detail.range}` : null,
                  row.detail.duration ? `Duração ${row.detail.duration}` : null,
                  row.detail.componentsLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <PhbProse text={row.detail.description} />
              {row.detail.higherLevels ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    Em níveis superiores
                  </p>
                  <PhbProse text={row.detail.higherLevels} />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Descrição indisponível.
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}
