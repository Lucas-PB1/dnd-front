"use client";

import { useEffect, useState } from "react";

import type { CharacterDetail } from "@/entities/character";
import type { ClassOption } from "@/entities/character/sheet-types";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import {
  mergeMetamagicIntoClassOptions,
  readMetamagicSlugs,
  sorcererMetamagicLimit,
} from "@/features/character/character-sheet/lib/sorcerer/metamagic";
import { MetamagicPicker } from "@/features/character/character-sheet/ui/beyond/sorcerer/metamagic-picker";
import { useMetamagics } from "@/features/catalog/metamagic-catalog/api/use-metamagics";
import { Button } from "@/shared/ui/button";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";

type BeyondMetamagicsPanelProps = {
  characterId: string;
  character: CharacterDetail;
};

export function BeyondMetamagicsPanel({
  characterId,
  character,
}: BeyondMetamagicsPanelProps) {
  if (character.classSlug !== "sorcerer" || character.level < 2) return null;

  return (
    <BeyondMetamagicsPanelInner
      characterId={characterId}
      character={character}
    />
  );
}

function BeyondMetamagicsPanelInner({
  characterId,
  character,
}: BeyondMetamagicsPanelProps) {
  const patchCharacter = usePatchCharacter(characterId);
  const catalogQuery = useMetamagics();
  const saved = readMetamagicSlugs(character.classOptions);
  const [slugs, setSlugs] = useState(saved);

  const savedKey = JSON.stringify(saved);
  useEffect(() => {
    setSlugs(saved);
  }, [savedKey]);

  const dirty = JSON.stringify(slugs) !== savedKey;
  const limit = sorcererMetamagicLimit(character.level);

  async function save() {
    const next = mergeMetamagicIntoClassOptions(
      (character.classOptions ?? []) as ClassOption[],
      slugs,
    );
    await patchCharacter.mutateAsync({ classOptions: next });
  }

  return (
    <CollapsibleCard
      size="compact"
      defaultOpen={false}
      className="border-border/50 bg-card/40"
      title={`Metamagia (${slugs.length}/${limit})`}
      subtitle="Escolha e troque opções de Metamagia na ficha (validadas na API)."
    >
      <div className="space-y-2">
        {catalogQuery.isPending ? (
          <p className="text-xs text-muted-foreground">Carregando catálogo…</p>
        ) : catalogQuery.isError ? (
          <p className="text-xs text-destructive">Falha ao carregar Metamagias.</p>
        ) : (
          <MetamagicPicker
            level={character.level}
            catalog={catalogQuery.data ?? []}
            selectedSlugs={slugs}
            onChange={setSlugs}
          />
        )}
        <Button
          type="button"
          size="sm"
          disabled={!dirty || patchCharacter.isPending || slugs.length !== limit}
          onClick={() => void save()}
        >
          Salvar Metamagias
        </Button>
      </div>
    </CollapsibleCard>
  );
}
