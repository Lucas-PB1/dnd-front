"use client";

import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import { previewBackgroundAbilityBoosts } from "@/entities/character/lib/background-boost";
import { abilityModifierValue } from "@/entities/character";
import { ABILITY_KEYS } from "@/features/create-character/lib/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import type { CharacterDetail } from "@/entities/character/types";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import { useSubclassOptions } from "@/features/class-catalog/api/use-classes";
import {
  useBackgroundDetail,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import { formatCharacterFeatLabel } from "@/entities/character/lib/character-feat";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/asi-feat-slots-to-feats";
import { previewCreateCharacterFeats } from "@/features/create-character/lib/preview-create-character-feats";
import { useFeatOptionLabels } from "@/features/feat-catalog/api/use-feat-option-labels";
import { useFeats } from "@/features/reference-catalog/api/use-reference";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { cn } from "@/shared/lib/utils";

type StepReviewProps = {
  control: Control<CreateCharacterInput>;
};

function previewCharacter(values: CreateCharacterInput): CharacterDetail {
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const finalScores =
    plus2 && plus1 && plus2 !== plus1
      ? previewBackgroundAbilityBoosts(
          values.abilityScores,
          plus2 as keyof typeof values.abilityScores,
          plus1 as keyof typeof values.abilityScores,
        )
      : values.abilityScores;

  return {
    id: "",
    name: values.name,
    level: values.level,
    classSlug: values.classSlug,
    speciesSlug: values.speciesSlug,
    backgroundSlug: values.backgroundSlug,
    subclassSlug: values.subclassSlug?.trim() ? values.subclassSlug : null,
    alignmentSlug: values.alignmentSlug?.trim()
      ? values.alignmentSlug.trim()
      : null,
    abilityScores: finalScores,
    hitPointsMax: null,
    hitPointsCurrent: null,
    proficiencyBonus: 0,
    classSkillSlugs: values.classSkillSlugs,
    backgroundSkillSlugs: [],
    speciesChoices: values.speciesChoices,
    subclassOptions: values.subclassOptions,
    characterFeats: [],
    featOptions: values.featOptions,
    characterSpells: values.characterSpells,
    equipment: values.equipment,
    languageSlugs: values.languageSlugs,
    abilityGenerationMethodSlug: values.abilityGenerationMethodSlug,
    backgroundAbilityBoostPlus2Slug:
      values.backgroundAbilityBoostPlus2Slug ?? null,
    backgroundAbilityBoostPlus1Slug:
      values.backgroundAbilityBoostPlus1Slug ?? null,
    backgroundToolItemSlug: values.backgroundToolItemSlug?.trim()
      ? values.backgroundToolItemSlug.trim()
      : null,
    abilityModifiers: {
      forca: abilityModifierValue(finalScores.forca),
      destreza: abilityModifierValue(finalScores.destreza),
      constituicao: abilityModifierValue(finalScores.constituicao),
      inteligencia: abilityModifierValue(finalScores.inteligencia),
      sabedoria: abilityModifierValue(finalScores.sabedoria),
      carisma: abilityModifierValue(finalScores.carisma),
    },
    passivePerception: 10 + abilityModifierValue(finalScores.sabedoria),
    armorClass: 10 + abilityModifierValue(finalScores.destreza),
    armorClassNote: "Sem armadura",
    createdAt: "",
    updatedAt: "",
  };
}

function ReviewSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-3 border-b border-border/70 pb-5 last:border-b-0 last:pb-0",
        className,
      )}
    >
      <h3 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Nenhum</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md border border-border bg-muted/30 px-2.5 py-1 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function StepReview({ control }: StepReviewProps) {
  const values = useWatch({ control }) as CreateCharacterInput;
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const labels = useCharacterCatalogLabels(previewCharacter(values));
  const speciesTraits = useSpeciesTraitChoices(
    values.speciesSlug,
    !!values.speciesSlug,
  );
  const subclassOpts = useSubclassOptions(
    values.subclassSlug ?? "",
    values.level,
    isSubclassRequired(values.level) && !!values.subclassSlug,
  );
  const backgroundDetail = useBackgroundDetail(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const backgroundSkills = useBackgroundSkills(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const needsToolChoice =
    backgroundDetail.data?.toolProficiencyKind === "choice";
  const backgroundTools = useBackgroundTools(
    values.backgroundSlug,
    needsToolChoice,
  );
  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? "";
  const allFeats = useFeats();
  const previewFeats = previewCreateCharacterFeats(
    originFeatSlug || null,
    asiFeatSlotsToCharacterFeats(values.asiFeatSlotSlugs ?? []),
  );
  const featNameBySlug = Object.fromEntries(
    (allFeats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
  );
  const { resolveFeatOption } = useFeatOptionLabels({
    characterFeats: previewFeats,
    labelContext: {
      resolveSpell: labels.resolveSpell,
      resolveSkill: labels.resolveSkill,
    },
  });

  const toolLabel =
    backgroundDetail.data?.toolProficiencyKind === "fixed"
      ? (backgroundDetail.data.toolItemName ??
        backgroundDetail.data.toolItemSlug)
      : values.backgroundToolItemSlug
        ? (backgroundTools.data?.data.find(
            (t) => t.itemSlug === values.backgroundToolItemSlug,
          )?.itemName ?? values.backgroundToolItemSlug)
        : null;

  function speciesChoiceLabel(kind: string, slug: string) {
    const row = speciesTraits.data?.data.find(
      (r) => r.choiceKind === kind && r.choiceSlug === slug,
    );
    return row?.choiceName ?? slug;
  }

  function subclassOptionLabel(optionKey: string, valueId: string) {
    const group = subclassOpts.data?.data.find(
      (g) => g.optionKey === optionKey,
    );
    const value = group?.values.find((v) => v.valueId === valueId);
    return value?.label ?? valueId;
  }

  function featOptionLabel(option: (typeof values.featOptions)[number]) {
    const display = resolveFeatOption(option);
    return `${display.label}: ${display.value}`;
  }

  const methodLabel =
    values.abilityGenerationMethodSlug === "point-buy"
      ? "Compra de pontos"
      : values.abilityGenerationMethodSlug === "standard-array"
        ? "Array padrão"
        : values.abilityGenerationMethodSlug;

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-2 text-sm text-muted-foreground">
        Confira os dados antes de criar. Você ainda pode voltar e ajustar.
      </p>

      <ReviewSection title="Identidade">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Nome
            </dt>
            <dd className="font-heading text-xl font-semibold">
              {values.name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Nível
            </dt>
            <dd className="text-lg font-medium">{values.level}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Espécie
            </dt>
            <dd>{labels.identity.speciesName ?? values.speciesSlug}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Classe
            </dt>
            <dd>{labels.identity.className ?? values.classSlug}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Antecedente
            </dt>
            <dd>{labels.identity.backgroundName ?? values.backgroundSlug}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Subclasse
            </dt>
            <dd>
              {labels.identity.subclassName ?? (
                <span className="text-muted-foreground">Não se aplica</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Alinhamento
            </dt>
            <dd>
              {labels.identity.alignmentName ?? (
                <span className="text-muted-foreground">Não definido</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Método de atributos
            </dt>
            <dd>{methodLabel}</dd>
          </div>
        </dl>
      </ReviewSection>

      <ReviewSection title="Atributos">
        {plus2 && plus1 && plus2 !== plus1 ? (
          <p className="text-sm text-muted-foreground">
            Bônus do antecedente: +2{" "}
            {ABILITY_LABELS_PT[plus2 as keyof typeof ABILITY_LABELS_PT]}, +1{" "}
            {ABILITY_LABELS_PT[plus1 as keyof typeof ABILITY_LABELS_PT]}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITY_KEYS.map((key) => {
            const score =
              plus2 && plus1 && plus2 !== plus1
                ? previewBackgroundAbilityBoosts(
                    values.abilityScores,
                    plus2 as keyof typeof values.abilityScores,
                    plus1 as keyof typeof values.abilityScores,
                  )[key]
                : values.abilityScores[key];
            return (
              <div
                key={key}
                className="rounded-lg border border-border px-2 py-2 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  {ABILITY_LABELS_PT[key]}
                </p>
                <p className="font-heading text-xl font-semibold">{score}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {abilityModifier(score)}
                </p>
              </div>
            );
          })}
        </div>
      </ReviewSection>

      <ReviewSection title="Perícias de classe">
        <ChipList
          items={values.classSkillSlugs.map((slug) =>
            labels.resolveSkill(slug),
          )}
        />
      </ReviewSection>

      <ReviewSection title="Talentos">
        {previewFeats.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum talento nesta ficha.
          </p>
        ) : (
          <div className="space-y-2">
            <ChipList
              items={previewFeats.map((feat) =>
                formatCharacterFeatLabel(feat, featNameBySlug, previewFeats),
              )}
            />
            {values.featOptions.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {values.featOptions.map((option) => (
                  <li
                    key={`${option.featSlug}-${option.instanceIndex}-${option.optionKey}`}
                  >
                    {featOptionLabel(option)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Antecedente">
        <dl className="space-y-2 text-sm">
          {(backgroundSkills.data?.data.length ?? 0) > 0 ? (
            <div>
              <dt className="text-muted-foreground">Perícias</dt>
              <dd>
                {backgroundSkills.data!.data.map((s) => s.name).join(", ")}
              </dd>
            </div>
          ) : null}
          {toolLabel ? (
            <div>
              <dt className="text-muted-foreground">Ferramenta</dt>
              <dd>{toolLabel}</dd>
            </div>
          ) : (
            <p className="text-muted-foreground">Sem ferramenta escolhida.</p>
          )}
        </dl>
      </ReviewSection>

      <ReviewSection title="Traços de espécie">
        <ChipList
          items={values.speciesChoices.map((c) =>
            speciesChoiceLabel(c.choiceKind, c.choiceSlug),
          )}
        />
      </ReviewSection>

      <ReviewSection title="Opções de subclasse">
        {values.subclassOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Não se aplica.</p>
        ) : (
          <ChipList
            items={values.subclassOptions.map((o) =>
              subclassOptionLabel(o.optionKey, o.valueId),
            )}
          />
        )}
      </ReviewSection>

      <ReviewSection title="Equipamento inicial">
        {values.equipment.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum item selecionado.
          </p>
        ) : (
          <ul className="list-disc space-y-1.5 pl-5 text-sm marker:text-primary">
            {values.equipment.map((item, i) => (
              <li
                key={`${item.source}-${item.packageSlug}-${item.itemSlug ?? i}`}
              >
                <span className="font-medium">
                  {item.source === "class" ? "Classe" : "Antecedente"}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · pacote {item.packageSlug}
                  {item.itemSlug ? ` · ${item.itemSlug}` : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ReviewSection>

      <ReviewSection title="Magias">
        {values.characterSpells.length === 0 ? (
          <p className="text-sm text-muted-foreground">Não se aplica.</p>
        ) : (
          <ChipList
            items={values.characterSpells.map(
              (s) => `${labels.resolveSpell(s.spellSlug)} (${s.listType})`,
            )}
          />
        )}
      </ReviewSection>

      <ReviewSection title="Idiomas">
        <ChipList
          items={values.languageSlugs.map((slug) =>
            labels.resolveLanguage(slug),
          )}
        />
      </ReviewSection>
    </div>
  );
}
