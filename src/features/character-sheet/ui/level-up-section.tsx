"use client";

import { useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterSpell } from "@/entities/character/sheet-types";
import { useClassSubclasses } from "@/features/class-catalog/api/use-classes";
import {
  useLevelUp,
  useLevelUpPreview,
} from "@/features/character-sheet/api/use-character-progression";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type LevelUpSectionProps = {
  characterId: string;
  character: CharacterDetail;
};

export function LevelUpSection({
  characterId,
  character,
}: LevelUpSectionProps) {
  const canLevelUp = character.level < 20;
  const preview = useLevelUpPreview(characterId, canLevelUp);
  const levelUp = useLevelUp(characterId);

  const [subclassSlug, setSubclassSlug] = useState(
    character.subclassSlug ?? "",
  );
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);

  const subclasses = useClassSubclasses(
    character.classSlug,
    !!preview.data?.subclassRequired,
  );

  if (!canLevelUp) {
    return (
      <p className="text-sm text-muted-foreground">
        Personagem no nível máximo (20).
      </p>
    );
  }

  if (preview.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando preview…</p>;
  }

  const data = preview.data;
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Preview de level-up indisponível.
      </p>
    );
  }

  function toggleSpell(slug: string, spellLevel: number) {
    const exists = selectedSpells.some((s) => s.spellSlug === slug);
    if (exists) {
      setSelectedSpells(selectedSpells.filter((s) => s.spellSlug !== slug));
      return;
    }
    setSelectedSpells([
      ...selectedSpells,
      {
        spellSlug: slug,
        listType: spellLevel === 0 ? "known" : "known",
      },
    ]);
  }

  async function handleLevelUp() {
    if (!data) return;
    const payload: Parameters<typeof levelUp.mutateAsync>[0] = {};
    if (data.subclassRequired && subclassSlug) {
      payload.subclassSlug = subclassSlug;
    }
    if (selectedSpells.length > 0) {
      const merged = [
        ...character.characterSpells.filter(
          (s) => !selectedSpells.some((n) => n.spellSlug === s.spellSlug),
        ),
        ...selectedSpells,
      ];
      payload.characterSpells = merged;
    }
    await levelUp.mutateAsync(payload);
    setSelectedSpells([]);
  }

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Nível atual → próximo</dt>
          <dd className="font-medium">
            {data.currentLevel} → {data.nextLevel}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Bônus de proficiência</dt>
          <dd className="font-medium">
            +{data.currentProficiencyBonus} → +{data.nextProficiencyBonus}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">PV estimados (máx)</dt>
          <dd className="font-medium">
            +{data.estimatedHpGain} → {data.estimatedHitPointsMax}
          </dd>
        </div>
        {data.isAsiOrFeatLevel ? (
          <div>
            <dt className="text-muted-foreground">Marco</dt>
            <dd className="font-medium">Nível de ASI / talento</dd>
          </div>
        ) : null}
      </dl>

      {data.subclassRequired ? (
        <CatalogSelect
          id="level-up-subclass"
          label="Subclasse"
          description={
            data.subclassUnlockLevel
              ? `Obrigatória no nível ${data.subclassUnlockLevel}.`
              : undefined
          }
          isLoading={subclasses.isPending}
          options={(subclasses.data?.data ?? []).map((s) => ({
            value: s.slug,
            label: s.name,
          }))}
          value={subclassSlug}
          onChange={(e) => setSubclassSlug(e.target.value)}
        />
      ) : null}

      {data.newSpellOptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Novas magias disponíveis</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.newSpellOptions.map((spell) => (
              <li key={spell.spellSlug}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    selectedSpells.some(
                      (s) => s.spellSlug === spell.spellSlug,
                    ) && "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpells.some(
                      (s) => s.spellSlug === spell.spellSlug,
                    )}
                    onChange={() =>
                      toggleSpell(spell.spellSlug, spell.spellLevel)
                    }
                  />
                  <span>
                    {spell.spellName}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (círculo {spell.spellLevel})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button
        type="button"
        disabled={levelUp.isPending || (data.subclassRequired && !subclassSlug)}
        onClick={handleLevelUp}
      >
        {levelUp.isPending
          ? "Subindo de nível…"
          : `Subir para nível ${data.nextLevel}`}
      </Button>

      {levelUp.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {levelUp.error instanceof Error
            ? levelUp.error.message
            : "Erro ao subir de nível"}
        </p>
      ) : null}

      {levelUp.isSuccess ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Nível atualizado com sucesso.
        </p>
      ) : null}
    </div>
  );
}
