"use client";

import { useEffect } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { characterThreadRankLabel } from "@/entities/character-thread/rank-label";
import {
  useCharacterThreadDetail,
  useCharacterThreads,
} from "@/features/catalog/character-thread-catalog/api/use-character-threads";
import { CatalogSelect } from "@/features/character/create-character/ui/catalog-select";
import {
  ChoicePreviewPanel,
  truncateChoiceHint,
} from "@/features/character/create-character/ui/choice-preview-panel";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import { Button } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";

type StepCharacterThreadProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepCharacterThread({
  control,
  setValue,
}: StepCharacterThreadProps) {
  const threadSlug = useWatch({
    control,
    name: "characterThreadSlug",
    defaultValue: "",
  });
  const goalIndex = useWatch({
    control,
    name: "characterThreadGoalIndex",
    defaultValue: undefined,
  });

  const list = useCharacterThreads(true);
  const detail = useCharacterThreadDetail(threadSlug ?? "", !!threadSlug);

  useEffect(() => {
    if (!threadSlug) {
      setValue("characterThreadGoalIndex", undefined);
    }
  }, [setValue, threadSlug]);

  const options = (list.data?.data ?? []).map((thread) => ({
    value: thread.slug,
    label: thread.name,
    hint: truncateChoiceHint(thread.summary),
  }));

  const goalOptions = (detail.data?.goals ?? []).map((goal) => ({
    value: String(goal.sortOrder),
    label: `${goal.sortOrder}. ${goal.text}`,
  }));

  const thread = detail.data;
  const specialRules = thread?.specialRulesText?.trim() ?? "";
  const summary = thread?.summary?.trim() ?? "";

  return (
    <div className="space-y-4">
      <WizardFormSection
        title="Thread (opcional)"
        description="Arco narrativo Northlands — um por vez. Pode pular se a campanha não usar."
      >
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[14rem] flex-1">
            <CatalogSelect
              id="characterThreadSlug"
              label="Thread"
              value={threadSlug ?? ""}
              onChange={(event) =>
                setValue("characterThreadSlug", event.target.value)
              }
              options={options}
              isLoading={list.isPending}
            />
          </div>
          {threadSlug ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setValue("characterThreadSlug", "");
                setValue("characterThreadGoalIndex", undefined);
              }}
            >
              Limpar
            </Button>
          ) : null}
        </div>
        {threadSlug && detail.isPending ? (
          <ChoicePreviewPanel title="Thread" loading className="mt-2" />
        ) : null}
        {thread && (summary || specialRules) ? (
          <ChoicePreviewPanel
            className="mt-2"
            title={thread.name}
            subtitle="Thread"
            teaser={summary || specialRules}
            detailText={specialRules || summary}
            detailBody={
              thread.milestones.length > 0 ? (
                <ul className="mt-3 space-y-3 border-t border-border/50 pt-3 text-sm">
                  {thread.milestones.map((milestone) => (
                    <li key={milestone.id}>
                      <p className="font-medium">
                        {characterThreadRankLabel(milestone.rank)}
                      </p>
                      <ul className="mt-1 space-y-1.5">
                        {milestone.benefits.map((benefit) => (
                          <li key={benefit.benefitKey}>
                            <p className="text-xs font-medium text-muted-foreground">
                              {benefit.name}
                            </p>
                            {benefit.description ? (
                              <PhbProse
                                text={benefit.description}
                                className="text-xs text-muted-foreground [&_p]:my-0.5"
                              />
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : null
            }
          />
        ) : null}
      </WizardFormSection>

      {threadSlug ? (
        <WizardFormSection
          title="Objetivo inicial"
          description="Escolha um modelo do catálogo ou deixe em branco para definir depois."
        >
          <CatalogSelect
            id="characterThreadGoalIndex"
            label="Goal"
            value={goalIndex != null ? String(goalIndex) : ""}
            onChange={(event) =>
              setValue(
                "characterThreadGoalIndex",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            options={goalOptions}
            isLoading={detail.isPending}
          />
        </WizardFormSection>
      ) : null}
    </div>
  );
}
