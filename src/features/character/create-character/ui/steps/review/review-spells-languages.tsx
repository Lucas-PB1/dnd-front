"use client";

import type { useStepReview } from "@/features/character/create-character/lib/review/use-step-review";
import { SPELL_LIST_LABEL } from "@/features/character/create-character/lib/review/review-labels";
import { ReviewChipList } from "@/features/character/create-character/ui/steps/review/review-ui";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type ReviewData = ReturnType<typeof useStepReview>;

export function ReviewSpellsSection({ data }: { data: ReviewData }) {
  const { values, labels, cantrips, leveledSpells } = data;

  return (
    <WizardFormSection title="Magias" compact>
      {values.characterSpells.length === 0 ? (
        <p className="text-sm text-muted-foreground">Não se aplica.</p>
      ) : (
        <div className="space-y-3">
          {cantrips.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Truques
              </p>
              <ReviewChipList
                items={cantrips.map((s) => ({
                  key: `c-${s.spellSlug}-${s.listType}`,
                  label: labels.resolveSpell(s.spellSlug),
                }))}
              />
            </div>
          ) : null}
          {leveledSpells.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Magias
              </p>
              <ReviewChipList
                items={leveledSpells.map((s) => ({
                  key: `l-${s.spellSlug}-${s.listType}`,
                  label: labels.resolveSpell(s.spellSlug),
                  hint: SPELL_LIST_LABEL[s.listType] ?? s.listType,
                }))}
              />
            </div>
          ) : null}
        </div>
      )}
    </WizardFormSection>
  );
}

export function ReviewLanguagesSection({ data }: { data: ReviewData }) {
  const { values, labels, langQuota } = data;

  return (
    <WizardFormSection title="Idiomas" compact>
      <ReviewChipList
        items={values.languageSlugs.map((slug) => ({
          key: slug,
          label: labels.resolveLanguage(slug),
          hint: langQuota.granted.includes(slug) ? "Antecedente" : undefined,
        }))}
      />
      <p className="text-xs text-muted-foreground">
        {values.languageSlugs.length} / {langQuota.maxTotal}
      </p>
    </WizardFormSection>
  );
}
