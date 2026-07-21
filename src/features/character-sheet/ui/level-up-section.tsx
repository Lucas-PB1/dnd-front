"use client";

import { useMemo, useState } from "react";

import {
  appendCharacterFeat,
  canAddCharacterFeat,
} from "@/entities/character/lib/character-feat";
import type { CharacterDetail } from "@/entities/character/types";
import type {
  CharacterSpell,
  FeatOption,
} from "@/entities/character/sheet-types";
import { useClassSubclasses } from "@/features/class-catalog/api/use-classes";
import {
  useLevelUp,
  useLevelUpPreview,
} from "@/features/character-sheet/api/use-character-progression";
import { findIncompleteCreateFeatOptions } from "@/features/create-character/lib/validate-create-feat-options";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { useFeatOptions } from "@/features/feat-catalog/api/use-feat-options";
import { FeatOptionsEditor } from "@/features/feat-catalog/ui/feat-options-editor";
import { useFeats } from "@/features/reference-catalog/api/use-reference";
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
  const feats = useFeats();

  const [subclassSlug, setSubclassSlug] = useState(
    character.subclassSlug ?? "",
  );
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [selectedFeatSlug, setSelectedFeatSlug] = useState("");
  const [levelUpFeatOptions, setLevelUpFeatOptions] = useState<FeatOption[]>(
    [],
  );
  const [levelUpError, setLevelUpError] = useState<string | undefined>();

  const subclasses = useClassSubclasses(
    character.classSlug,
    !!preview.data?.subclassRequired,
  );

  const newFeatInstance = useMemo(() => {
    if (!selectedFeatSlug) return null;
    const merged = appendCharacterFeat(
      character.characterFeats,
      selectedFeatSlug,
    );
    return merged[merged.length - 1] ?? null;
  }, [selectedFeatSlug, character.characterFeats]);

  const selectedFeatOptionDefs = useFeatOptions(
    selectedFeatSlug,
    !!selectedFeatSlug,
  );
  const hasFeatOptions = (selectedFeatOptionDefs.data?.data.length ?? 0) > 0;

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [feats.data?.data],
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
    setLevelUpError(undefined);

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
    if (data.isAsiOrFeatLevel && selectedFeatSlug && newFeatInstance) {
      const feat = (feats.data?.data ?? []).find(
        (item) => item.slug === selectedFeatSlug,
      );
      if (
        feat &&
        canAddCharacterFeat(
          character.characterFeats,
          selectedFeatSlug,
          feat.repeatable,
        )
      ) {
        if (hasFeatOptions) {
          const incomplete = await findIncompleteCreateFeatOptions(
            [newFeatInstance],
            levelUpFeatOptions,
            featNameBySlug,
            character.level + 1,
          );
          if (incomplete) {
            setLevelUpError(incomplete);
            return;
          }
        }

        payload.characterFeats = appendCharacterFeat(
          character.characterFeats,
          selectedFeatSlug,
        );
        if (levelUpFeatOptions.length > 0) {
          payload.featOptions = [
            ...character.featOptions,
            ...levelUpFeatOptions,
          ];
        }
      }
    }
    await levelUp.mutateAsync(payload);
    setSelectedSpells([]);
    setSelectedFeatSlug("");
    setLevelUpFeatOptions([]);
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

      {data.isAsiOrFeatLevel ? (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
          <p className="font-medium">Melhoria de atributos ou talento</p>
          <p className="text-muted-foreground">
            Para +2/+1 em atributos, edite a seção{" "}
            <span className="font-medium text-foreground">Atributos</span> após
            subir de nível. Ou escolha um talento abaixo para incluir na subida.
          </p>
          {feats.isPending ? (
            <p className="text-muted-foreground">Carregando talentos…</p>
          ) : (
            <CatalogSelect
              id="level-up-feat"
              label="Adicionar talento (opcional)"
              options={[
                { value: "", label: "Nenhum — só subir de nível" },
                ...(feats.data?.data ?? [])
                  .filter((feat) =>
                    canAddCharacterFeat(
                      character.characterFeats,
                      feat.slug,
                      feat.repeatable,
                    ),
                  )
                  .map((feat) => ({
                    value: feat.slug,
                    label: feat.repeatable
                      ? `${feat.name} (repetível)`
                      : feat.name,
                  })),
              ]}
              value={selectedFeatSlug}
              onChange={(e) => {
                setSelectedFeatSlug(e.target.value);
                setLevelUpFeatOptions([]);
                setLevelUpError(undefined);
              }}
            />
          )}
          {hasFeatOptions && newFeatInstance ? (
            <div className="border-t border-border pt-3">
              <FeatOptionsEditor
                characterFeats={[newFeatInstance]}
                featNameBySlug={featNameBySlug}
                value={levelUpFeatOptions}
                characterLevel={character.level + 1}
                classSlug={character.classSlug}
                onChange={setLevelUpFeatOptions}
              />
            </div>
          ) : null}
        </div>
      ) : null}

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

      {levelUpError ? (
        <p className="text-sm text-destructive" role="alert">
          {levelUpError}
        </p>
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
