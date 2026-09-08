"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import type {
  LevelUpClassExpertiseSlot,
  LevelUpFeatureUnlock,
  LevelUpSpellOption,
  LevelUpSubclassOptionSlot,
  LevelUpWeaponMasterySlot,
} from "@/entities/character/session-types";
import { FeatureDetailDialog } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { Button } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";

type LevelUpUnlocksPanelProps = {
  nextLevel: number;
  isAsiOrFeatLevel: boolean;
  subclassRequired: boolean;
  newFeatures: LevelUpFeatureUnlock[];
  newAlwaysPreparedSpells: LevelUpSpellOption[];
  newSpellOptionsCount: number;
  newSubclassOptionSlots: LevelUpSubclassOptionSlot[];
  newExpertiseSlots: LevelUpClassExpertiseSlot[];
  newMasterySlots: LevelUpWeaponMasterySlot[];
};

function featureTeaser(description: string, maxChars = 180): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trim()}…`;
}

function LevelUpFeatureCard({ feature }: { feature: LevelUpFeatureUnlock }) {
  const [open, setOpen] = useState(false);
  const sourceLabel = feature.source === "class" ? "Classe" : "Subclasse";
  const description = feature.description.trim();
  const teaser = featureTeaser(description);

  return (
    <div className="flex items-start gap-1.5 rounded-md border border-border/50 bg-background/40 px-2.5 py-2">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
          {sourceLabel}
        </p>
        <p className="text-sm font-medium text-foreground">{feature.name}</p>
        {teaser ? (
          <PhbProse
            text={teaser}
            className="text-xs leading-snug text-muted-foreground [&_p]:my-0"
          />
        ) : null}
      </div>
      {description ? (
        <>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="mt-0.5 size-11 shrink-0 touch-manipulation p-0 text-muted-foreground sm:size-7"
            aria-label={`Ver detalhe de ${feature.name}`}
            title={`Ver detalhe: ${feature.name}`}
            onClick={() => setOpen(true)}
          >
            <InformationCircleIcon className="size-5 sm:size-4" aria-hidden />
          </Button>
          <FeatureDetailDialog
            open={open}
            onOpenChange={setOpen}
            title={feature.name}
            subtitle={sourceLabel}
          >
            <PhbProse text={description} />
          </FeatureDetailDialog>
        </>
      ) : null}
    </div>
  );
}

/** Lista o que o próximo nível concede — com ou sem escolha. */
export function LevelUpUnlocksPanel({
  nextLevel,
  isAsiOrFeatLevel,
  subclassRequired,
  newFeatures,
  newAlwaysPreparedSpells,
  newSpellOptionsCount,
  newSubclassOptionSlots,
  newExpertiseSlots,
  newMasterySlots,
}: LevelUpUnlocksPanelProps) {
  const notes: string[] = [];
  if (isAsiOrFeatLevel) {
    notes.push("Melhoria de atributo (ASI) ou um talento");
  }
  if (subclassRequired) {
    notes.push("Escolha de subclasse");
  }
  if (newExpertiseSlots.length > 0) {
    notes.push(
      `Especialização (${newExpertiseSlots.length} ${newExpertiseSlots.length === 1 ? "perícia" : "perícias"})`,
    );
  }
  if (newMasterySlots.length > 0) {
    notes.push(
      `Maestria em arma (${newMasterySlots.length} ${newMasterySlots.length === 1 ? "arma" : "armas"})`,
    );
  }
  if (newSubclassOptionSlots.length > 0) {
    notes.push(
      ...newSubclassOptionSlots.map((slot) => slot.label || slot.optionKey),
    );
  }
  if (newSpellOptionsCount > 0) {
    notes.push(
      `Magias da lista disponíveis para escolher na aba Magias (${newSpellOptionsCount})`,
    );
  }

  const hasContent =
    newFeatures.length > 0 ||
    newAlwaysPreparedSpells.length > 0 ||
    notes.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
        Nenhuma característica nova listada no nível {nextLevel} além do
        aumento de PV.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
      <div className="space-y-0.5">
        <p className="font-medium">Neste nível você ganha</p>
        <p className="text-muted-foreground">
          Cada traço em um card — toque no ℹ para o texto completo.
        </p>
      </div>

      {newFeatures.length > 0 ? (
        <ul className="space-y-2">
          {newFeatures.map((feature) => (
            <li key={`${feature.source}-${feature.level}-${feature.name}`}>
              <LevelUpFeatureCard feature={feature} />
            </li>
          ))}
        </ul>
      ) : null}

      {newAlwaysPreparedSpells.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Magias sempre preparadas
          </p>
          <ul className="list-inside list-disc text-muted-foreground">
            {newAlwaysPreparedSpells.map((spell) => (
              <li key={spell.spellSlug}>{spell.spellName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {notes.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Também neste nível
          </p>
          <ul className="list-inside list-disc text-muted-foreground">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
