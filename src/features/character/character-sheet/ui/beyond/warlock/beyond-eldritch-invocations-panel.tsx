"use client";

import { useEffect, useState } from "react";

import type { CharacterDetail } from "@/entities/character";
import type { ClassOption } from "@/entities/character/sheet-types";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import {
  mergeEldritchInvocationsIntoClassOptions,
  readEldritchInvocationSlugs,
  warlockInvocationLimit,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { EldritchInvocationPicker } from "@/features/character/character-sheet/ui/beyond/warlock/eldritch-invocation-picker";
import { useEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/use-eldritch-invocations";
import { Button } from "@/shared/ui/button";

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
  const saved = readEldritchInvocationSlugs(character.classOptions);
  const [slugs, setSlugs] = useState(saved);

  useEffect(() => {
    setSlugs(saved);
  }, [saved.join("|")]);

  const dirty = slugs.join("|") !== saved.join("|");
  const limit = warlockInvocationLimit(character.level);

  async function save() {
    const next = mergeEldritchInvocationsIntoClassOptions(
      (character.classOptions ?? []) as ClassOption[],
      slugs,
    );
    await patchCharacter.mutateAsync({ classOptions: next });
  }

  return (
    <section
      className="space-y-2 rounded-xl border border-border/50 bg-card/40 p-3"
      aria-labelledby="eldritch-invocations-heading"
    >
      <div>
        <h3
          id="eldritch-invocations-heading"
          className="text-sm font-semibold text-foreground"
        >
          Invocações Místicas ({slugs.length}/{limit})
        </h3>
        <p className="text-xs text-muted-foreground">
          Escolha e troque invocações na ficha (pré-requisitos de nível/pacto
          validados na API).
        </p>
      </div>

      {catalogQuery.isPending ? (
        <p className="text-xs text-muted-foreground">Carregando catálogo…</p>
      ) : catalogQuery.isError ? (
        <p className="text-xs text-destructive">Falha ao carregar invocações.</p>
      ) : (
        <EldritchInvocationPicker
          level={character.level}
          catalog={catalogQuery.data ?? []}
          selectedSlugs={slugs}
          onChange={setSlugs}
          disabled={patchCharacter.isPending}
        />
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!dirty || patchCharacter.isPending || slugs.length > limit}
          onClick={() => void save()}
        >
          Salvar invocações
        </Button>
      </div>
    </section>
  );
}
