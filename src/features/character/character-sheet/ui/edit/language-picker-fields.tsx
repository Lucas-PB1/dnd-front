"use client";

import { useMemo, useState } from "react";

import {
  languageQuota,
  syncLanguagesForBackground,
  toggleLanguageSelection,
} from "@/features/character/create-character/lib/languages/language-selection";
import {
  useBackgroundDetail,
  useBackgroundLanguages,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import { useLanguages } from "@/features/catalog/reference-catalog/api/use-reference";
import { cn } from "@/shared/lib/utils";

type UseSheetLanguageSelectionArgs = {
  backgroundSlug: string;
  initialSlugs: string[];
};

/** Cota do antecedente + seleção local (mesma regra do wizard). */
export function useSheetLanguageSelection({
  backgroundSlug,
  initialSlugs,
}: UseSheetLanguageSelectionArgs) {
  const languages = useLanguages();
  const background = useBackgroundDetail(backgroundSlug, !!backgroundSlug);
  const fixedLanguages = useBackgroundLanguages(
    backgroundSlug,
    !!backgroundSlug,
  );

  const grant = useMemo(
    () => ({
      grantedSlugs: (fixedLanguages.data?.data ?? []).map((row) => row.slug),
      languageChoiceCount: background.data?.languageChoiceCount ?? 2,
    }),
    [fixedLanguages.data?.data, background.data?.languageChoiceCount],
  );

  const quota = useMemo(() => languageQuota(grant), [grant]);
  const grantKey = `${grant.grantedSlugs.join(",")}:${grant.languageChoiceCount}`;
  const grantReady =
    !!backgroundSlug &&
    !background.isPending &&
    !fixedLanguages.isPending;

  const initialKey = initialSlugs.join(",");
  const syncedInitial = useMemo(
    () =>
      grantReady
        ? syncLanguagesForBackground(initialSlugs, grant)
        : initialSlugs,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- grantKey/initialKey cobrem o snapshot
    [grantReady, grantKey, initialKey],
  );

  const [selectedOverride, setSelectedOverride] = useState<string[] | null>(
    null,
  );
  const [trackedGrantKey, setTrackedGrantKey] = useState(grantKey);

  if (grantReady && grantKey !== trackedGrantKey) {
    setTrackedGrantKey(grantKey);
    setSelectedOverride(null);
  }

  const selected = selectedOverride ?? syncedInitial;
  const [hint, setHint] = useState<string | null>(null);
  const chosenCount = selected.filter((s) => !quota.granted.includes(s)).length;

  function toggle(slug: string) {
    const result = toggleLanguageSelection(selected, slug, grant);
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    setHint(null);
    setSelectedOverride(result.next);
  }

  function syncedSelection() {
    return syncLanguagesForBackground(selected, grant);
  }

  return {
    languages,
    quota,
    grantReady,
    selected,
    chosenCount,
    hint,
    toggle,
    syncedSelection,
  };
}

type LanguagePickerFieldsProps = {
  languagesPending: boolean;
  grantReady: boolean;
  quota: ReturnType<typeof languageQuota>;
  selected: string[];
  chosenCount: number;
  hint: string | null;
  onToggle: (slug: string) => void;
  languageRows: { slug: string; name: string }[];
};

export function LanguagePickerFields({
  languagesPending,
  grantReady,
  quota,
  selected,
  chosenCount,
  hint,
  onToggle,
  languageRows,
}: LanguagePickerFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <p className="text-[11px] text-muted-foreground">
          {quota.choiceCount === 0
            ? "Antecedente define os idiomas — sem escolha extra."
            : `Antecedente: ${quota.granted.length} fixo(s) + ${quota.choiceCount} à escolha.`}
        </p>
        <p className="tabular-nums text-sm font-semibold">
          {selected.length}
          <span className="font-normal text-muted-foreground">
            {" "}
            / {quota.maxTotal}
          </span>
        </p>
      </div>

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

      {languagesPending || !grantReady ? (
        <p className="text-sm text-muted-foreground">Carregando idiomas…</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {languageRows.map((lang) => {
            const granted = quota.granted.includes(lang.slug);
            const checked = selected.includes(lang.slug);
            const atLimit =
              !checked && !granted && chosenCount >= quota.choiceCount;
            return (
              <li key={lang.slug}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                    checked && "border-primary bg-primary/5",
                    granted && "border-primary/40 bg-primary/5",
                    atLimit && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={granted || atLimit}
                    onChange={() => onToggle(lang.slug)}
                    className="size-4 rounded border-input"
                  />
                  <span className="min-w-0">
                    <span className="font-medium">{lang.name}</span>
                    {granted ? (
                      <span className="mt-0.5 block text-[10px] tracking-wide text-muted-foreground uppercase">
                        Antecedente
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
