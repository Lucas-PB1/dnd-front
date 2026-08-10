"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterDetail } from "@/entities/character";
import type { ClassOption } from "@/entities/character/sheet-types";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import {
  isLessonsOfTheFirstOnesSlug,
  mergeEldritchInvocationsIntoClassOptions,
  readEldritchInvocationPicks,
  warlockInvocationLimit,
  type EldritchInvocationPick,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import {
  EldritchInvocationPicker,
  type EldritchCantripOption,
  type EldritchOriginFeatOption,
} from "@/features/character/character-sheet/ui/beyond/warlock/eldritch-invocation-picker";
import { useEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/use-eldritch-invocations";
import { useFeatsCatalog } from "@/features/catalog/feat-catalog/api/use-feats";
import { useSpellLabels } from "@/features/catalog/spell-catalog/api/use-spells";
import { Button } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";

type BeyondEldritchInvocationsPanelProps = {
  characterId: string;
  character: CharacterDetail;
};

export function BeyondEldritchInvocationsPanel({
  characterId,
  character,
}: BeyondEldritchInvocationsPanelProps) {
  if (character.classSlug !== "warlock") return null;

  return (
    <BeyondEldritchInvocationsPanelInner
      characterId={characterId}
      character={character}
    />
  );
}

function BeyondEldritchInvocationsPanelInner({
  characterId,
  character,
}: BeyondEldritchInvocationsPanelProps) {
  const patchCharacter = usePatchCharacter(characterId);
  const catalogQuery = useEldritchInvocations(character.level);
  const originFeatsQuery = useFeatsCatalog({
    page: 1,
    q: "",
    category: "origin",
  });
  const spellLabels = useSpellLabels();
  const saved = readEldritchInvocationPicks(character.classOptions);
  const [picks, setPicks] = useState<EldritchInvocationPick[]>(saved);

  const savedKey = JSON.stringify(saved);
  useEffect(() => {
    setPicks(saved);
  }, [savedKey]);

  const dirty = JSON.stringify(picks) !== savedKey;
  const limit = warlockInvocationLimit(character.level);

  const cantripOptions = useMemo((): EldritchCantripOption[] => {
    const nameBySlug = new Map(
      (spellLabels.data?.data ?? []).map((spell) => [spell.slug, spell.name]),
    );
    const seen = new Set<string>();
    const options: EldritchCantripOption[] = [];
    for (const spell of character.characterSpells ?? []) {
      if (seen.has(spell.spellSlug)) continue;
      seen.add(spell.spellSlug);
      options.push({
        value: spell.spellSlug,
        label: nameBySlug.get(spell.spellSlug) ?? spell.spellSlug,
        dealsDamage: true,
        requiresAttackRoll: true,
        rangeMeters: 36,
      });
    }
    return options;
  }, [character.characterSpells, spellLabels.data]);

  const originFeatOptions = useMemo((): EldritchOriginFeatOption[] => {
    return (originFeatsQuery.data?.data ?? []).map((feat) => ({
      value: feat.slug,
      label: feat.name,
    }));
  }, [originFeatsQuery.data]);

  const occupiedOriginFeatSlugs = useMemo(() => {
    const lessonsFeats = new Set(
      picks
        .filter((pick) => isLessonsOfTheFirstOnesSlug(pick.slug))
        .map((pick) => pick.originFeatSlug)
        .filter((slug): slug is string => Boolean(slug)),
    );
    return new Set(
      (character.characterFeats ?? [])
        .map((feat) => feat.featSlug)
        .filter((slug) => !lessonsFeats.has(slug)),
    );
  }, [character.characterFeats, picks]);

  async function save() {
    const next = mergeEldritchInvocationsIntoClassOptions(
      (character.classOptions ?? []) as ClassOption[],
      picks,
    );
    await patchCharacter.mutateAsync({ classOptions: next });
  }

  return (
    <CollapsibleCard
      size="compact"
      defaultOpen={false}
      className="border-border/50 bg-card/40"
      title={`Invocações Místicas (${picks.length}/${limit})`}
      subtitle="Escolha e troque invocações na ficha (pré-requisitos de nível/pacto validados na API)."
    >
      <div className="space-y-2">
        {catalogQuery.isPending || originFeatsQuery.isPending ? (
          <p className="text-xs text-muted-foreground">Carregando catálogo…</p>
        ) : catalogQuery.isError ? (
          <p className="text-xs text-destructive">
            Falha ao carregar invocações.
          </p>
        ) : (
          <EldritchInvocationPicker
            level={character.level}
            catalog={catalogQuery.data ?? []}
            selectedPicks={picks}
            cantripOptions={cantripOptions}
            originFeatOptions={originFeatOptions}
            occupiedOriginFeatSlugs={occupiedOriginFeatSlugs}
            onChange={setPicks}
            disabled={patchCharacter.isPending}
          />
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={!dirty || patchCharacter.isPending || picks.length > limit}
            onClick={() => void save()}
          >
            Salvar invocações
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
}
