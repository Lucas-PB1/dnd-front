"use client";

import { useEffect, useMemo, useState } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import { classLanguageGrant } from "@/entities/character/lib/class-language-grant";
import {
  filterPickableLanguages,
  languageQuota,
  syncLanguagesForBackground,
  toggleLanguageSelection,
} from "@/features/character/create-character/lib/languages/language-selection";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";
import {
  useBackgroundDetail,
  useBackgroundLanguages,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useLanguages } from "@/features/catalog/reference-catalog/api/use-reference";
import { cn } from "@/shared/lib/utils";

type StepLanguagesProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepLanguages({ control, setValue }: StepLanguagesProps) {
  const languages = useLanguages();
  const classSlug = useWatch({
    control,
    name: "classSlug",
    defaultValue: "",
  });
  const level = useWatch({
    control,
    name: "level",
    defaultValue: 1,
  });
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const selected = useWatch({
    control,
    name: "languageSlugs",
    defaultValue: [],
  });
  const [hint, setHint] = useState<string | null>(null);

  const background = useBackgroundDetail(backgroundSlug, !!backgroundSlug);
  const fixedLanguages = useBackgroundLanguages(
    backgroundSlug,
    !!backgroundSlug,
  );

  const classGrant = useMemo(
    () => classLanguageGrant(classSlug, level),
    [classSlug, level],
  );
  const grant = useMemo(
    () => ({
      grantedSlugs: (fixedLanguages.data?.data ?? []).map((row) => row.slug),
      languageChoiceCount: background.data?.languageChoiceCount ?? 2,
      extraGrantedSlugs: classGrant.grantedSlugs,
      extraChoiceCount: classGrant.choiceCount,
    }),
    [
      fixedLanguages.data?.data,
      background.data?.languageChoiceCount,
      classGrant.grantedSlugs,
      classGrant.choiceCount,
    ],
  );

  const quota = useMemo(() => languageQuota(grant), [grant]);
  const catalog = languages.data?.data ?? [];
  const pickableLanguages = useMemo(
    () => filterPickableLanguages(catalog, quota.granted),
    [catalog, quota.granted],
  );
  const grantReady =
    !!backgroundSlug &&
    !background.isPending &&
    !fixedLanguages.isPending;

  const chosenCount = selected.filter((s) => !quota.granted.includes(s)).length;

  useEffect(() => {
    if (!grantReady) return;
    const next = syncLanguagesForBackground(selected, grant, catalog);
    const same =
      next.length === selected.length &&
      next.every((slug, i) => slug === selected[i]);
    if (!same) {
      setValue("languageSlugs", next, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync por antecedente/classe/catálogo
  }, [
    grantReady,
    grant.grantedSlugs.join(","),
    grant.languageChoiceCount,
    classGrant.grantedSlugs.join(","),
    classGrant.choiceCount,
    catalog.map((row) => row.slug).join(","),
    setValue,
  ]);

  function toggle(slug: string) {
    const result = toggleLanguageSelection(selected, slug, grant, catalog);
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    setHint(null);
    setValue("languageSlugs", result.next, { shouldDirty: true });
  }

  return (
    <div className="space-y-3">
      <WizardFormSection title="Idiomas" compact>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
          <div className="space-y-0.5">
            <p className="text-xs font-medium">Cota</p>
            <p className="text-[11px] text-muted-foreground">
              {!backgroundSlug
                ? "Selecione um antecedente para ver a cota de idiomas."
                : quota.choiceCount === 0
                  ? "Seus idiomas vêm do antecedente e da classe — sem escolha extra."
                  : `Concedidos ${quota.granted.length} idioma(s) + ${quota.choiceCount} à escolha (idiomas padrão).`}
            </p>
          </div>
          <p className="tabular-nums text-sm font-semibold">
            {selected.length}
            <span className="font-normal text-muted-foreground">
              {" "}
              / {quota.maxTotal}
            </span>
          </p>
        </div>

        {quota.granted.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Concedidos:{" "}
            {quota.granted
              .map(
                (slug) =>
                  languages.data?.data?.find((l) => l.slug === slug)?.name ??
                  slug,
              )
              .join(", ")}
          </p>
        ) : null}

        {quota.choiceCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            Extras escolhidos: {chosenCount} / {quota.choiceCount}
          </p>
        ) : null}

        {hint ? (
          <p className="text-sm text-destructive" role="alert">
            {hint}
          </p>
        ) : null}

        {languages.isPending || !grantReady ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : quota.choiceCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma escolha extra — revise os concedidos acima.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pickableLanguages.map((lang) => {
              const checked = selected.includes(lang.slug);
              const atLimit =
                !checked && chosenCount >= quota.choiceCount;
              return (
                <li key={lang.slug}>
                  <label
                    className={cn(
                      "flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-sm",
                      checked && "border-primary bg-primary/5",
                      atLimit && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={atLimit}
                      onChange={() => toggle(lang.slug)}
                      className="size-4 shrink-0 rounded border-input"
                    />
                    <span className="min-w-0 truncate font-medium">
                      {lang.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </WizardFormSection>
    </div>
  );
}
