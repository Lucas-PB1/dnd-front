"use client";

import { useMemo, useState } from "react";

import {
  appendCharacterFeat,
  canAddCharacterFeat,
} from "@/entities/character/lib/character-feat";
import type { CharacterDetail } from "@/entities/character/types";
import type { ClassOption } from "@/entities/character/sheet-types";
import type { FeatOption } from "@/entities/character/sheet-types";
import { useClassSubclasses } from "@/features/class-catalog/api/use-classes";
import {
  useLevelUp,
  useLevelUpPreview,
} from "@/features/character-sheet/api/use-character-progression";
import {
  LevelUpClassExpertise,
  levelUpExpertiseComplete,
} from "@/features/character-sheet/ui/level-up-class-expertise";
import {
  isLevelUpAsiComplete,
  LevelUpAsiPicker,
} from "@/features/character-sheet/ui/level-up-asi-picker";
import {
  LevelUpWeaponMastery,
  levelUpWeaponMasteryComplete,
} from "@/features/character-sheet/ui/level-up-weapon-mastery";
import { findIncompleteCreateFeatOptions } from "@/features/create-character/lib/validate-create-feat-options";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { useFeatOptions } from "@/features/feat-catalog/api/use-feat-options";
import { FeatOptionsEditor } from "@/features/feat-catalog/ui/feat-options-editor";
import { useFeats } from "@/features/reference-catalog/api/use-reference";
import type { LevelUpAsiDistributionMode } from "@/entities/character/session-types";
import { Button } from "@/shared/ui/button";

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
  const [selectedFeatSlug, setSelectedFeatSlug] = useState("");
  const [levelUpFeatOptions, setLevelUpFeatOptions] = useState<FeatOption[]>(
    [],
  );
  const [levelUpClassOptions, setLevelUpClassOptions] = useState<ClassOption[]>(
    () => character.classOptions ?? [],
  );
  const [asiMode, setAsiMode] = useState<LevelUpAsiDistributionMode | "">("");
  const [asiPrimary, setAsiPrimary] = useState("");
  const [asiSecondary, setAsiSecondary] = useState("");
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

  const newExpertiseSlots = data.newClassExpertiseSlots ?? [];
  const newMasterySlots = data.newWeaponMasterySlots ?? [];
  const expertiseComplete = levelUpExpertiseComplete(
    newExpertiseSlots,
    levelUpClassOptions,
  );
  const masteryComplete = levelUpWeaponMasteryComplete(
    newMasterySlots,
    levelUpClassOptions,
  );

  async function handleLevelUp() {
    if (!data) return;
    setLevelUpError(undefined);

    if (data.isAsiOrFeatLevel && asiMode && selectedFeatSlug) {
      setLevelUpError("Escolha ASI ou talento neste nível — não os dois.");
      return;
    }
    if (
      data.isAsiOrFeatLevel &&
      !isLevelUpAsiComplete(asiMode, asiPrimary, asiSecondary)
    ) {
      setLevelUpError("Complete a melhoria de atributo ou deixe em branco.");
      return;
    }

    const payload: Parameters<typeof levelUp.mutateAsync>[0] = {};
    if (data.subclassRequired && subclassSlug) {
      payload.subclassSlug = subclassSlug;
    }
    if (data.isAsiOrFeatLevel && asiMode) {
      payload.asiDistributionMode = asiMode;
      payload.asiPrimaryAbilitySlug = asiPrimary;
      if (asiMode === "plus1plus1") {
        payload.asiSecondaryAbilitySlug = asiSecondary;
      }
    }
    if (
      data.isAsiOrFeatLevel &&
      !asiMode &&
      selectedFeatSlug &&
      newFeatInstance
    ) {
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
    if (newExpertiseSlots.length > 0 || newMasterySlots.length > 0) {
      payload.classOptions = levelUpClassOptions;
    }
    const updated = await levelUp.mutateAsync(payload);
    setSelectedFeatSlug("");
    setLevelUpFeatOptions([]);
    setAsiMode("");
    setAsiPrimary("");
    setAsiSecondary("");
    if (updated) {
      setLevelUpClassOptions(updated.classOptions ?? []);
    }
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
        <div className="space-y-4 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
          <p className="text-muted-foreground">
            Neste nível escolha <span className="font-medium text-foreground">ASI</span>{" "}
            ou um <span className="font-medium text-foreground">talento</span> (não
            os dois).
          </p>
          <LevelUpAsiPicker
            scores={character.abilityScores}
            mode={asiMode}
            primarySlug={asiPrimary}
            secondarySlug={asiSecondary}
            disabled={!!selectedFeatSlug}
            onModeChange={(mode) => {
              setAsiMode(mode);
              setLevelUpError(undefined);
              if (mode) {
                setSelectedFeatSlug("");
                setLevelUpFeatOptions([]);
              }
            }}
            onPrimaryChange={setAsiPrimary}
            onSecondaryChange={setAsiSecondary}
          />
          <div className="border-t border-border pt-3 space-y-3">
            {feats.isPending ? (
              <p className="text-muted-foreground">Carregando talentos…</p>
            ) : (
              <CatalogSelect
                id="level-up-feat"
                label="Ou adicionar talento"
                disabled={!!asiMode}
                options={[
                  { value: "", label: "Nenhum talento" },
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
                  if (e.target.value) {
                    setAsiMode("");
                    setAsiPrimary("");
                    setAsiSecondary("");
                  }
                }}
              />
            )}
            {hasFeatOptions && newFeatInstance ? (
              <FeatOptionsEditor
                characterFeats={[newFeatInstance]}
                featNameBySlug={featNameBySlug}
                value={levelUpFeatOptions}
                characterLevel={character.level + 1}
                classSlug={character.classSlug}
                onChange={setLevelUpFeatOptions}
              />
            ) : null}
          </div>
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
        <div className="flex items-start gap-3 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
          <span
            aria-hidden
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary tabular-nums"
          >
            {data.newSpellOptions.length}
          </span>
          <div className="space-y-0.5">
            <p className="font-medium">Novas magias disponíveis</p>
            <p className="text-muted-foreground">
              Depois de subir de nível, escolha na aba{" "}
              <span className="font-medium text-foreground">Magias</span>.
            </p>
          </div>
        </div>
      ) : null}

      {newExpertiseSlots.length > 0 ? (
        <LevelUpClassExpertise
          character={character}
          newSlots={newExpertiseSlots}
          value={levelUpClassOptions}
          onChange={setLevelUpClassOptions}
        />
      ) : null}

      {newMasterySlots.length > 0 ? (
        <LevelUpWeaponMastery
          character={character}
          newSlots={newMasterySlots}
          value={levelUpClassOptions}
          onChange={setLevelUpClassOptions}
        />
      ) : null}

      {levelUpError ? (
        <p className="text-sm text-destructive" role="alert">
          {levelUpError}
        </p>
      ) : null}

      <Button
        type="button"
        disabled={
          levelUp.isPending ||
          (data.subclassRequired && !subclassSlug) ||
          (newExpertiseSlots.length > 0 && !expertiseComplete) ||
          (newMasterySlots.length > 0 && !masteryComplete)
        }
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
