"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useForm, useWatch } from "react-hook-form";

import { mergeCharacterSheet } from "@/application/character-sheet/merge-character-sheet";
import {
  createEmptyCharacterSheet,
  type CharacterSheet,
} from "@/application/character-sheet/character-sheet.schema";
import { CharacterSheetPageOne } from "@/presentation/components/character-sheet/character-sheet-page-one";
import { CharacterSheetPageTwo } from "@/presentation/components/character-sheet/character-sheet-page-two";
import { PAGE_ONE_SECTIONS } from "@/presentation/components/character-sheet/character-sheet-sections";
import { CharacterSheetToolbar } from "@/presentation/components/character-sheet/character-sheet-toolbar";
import {
  clearCharacterSheetDraft,
  useCharacterSheetDraft,
  useIsClient,
} from "@/presentation/hooks/use-character-sheet-draft";

type SheetPage = 1 | 2;

export function CharacterSheetForm() {
  const [page, setPage] = useState<SheetPage>(1);
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const emptySheet = useMemo(() => createEmptyCharacterSheet(), []);

  const { register, control, watch, setValue, reset } = useForm<CharacterSheet>(
    {
      defaultValues: emptySheet,
    },
  );

  const watchedSheet = useWatch({ control, defaultValue: emptySheet });
  const sheet = mergeCharacterSheet(watchedSheet);
  const { lastSavedAt } = useCharacterSheetDraft(reset, sheet, isClient);

  function handleClear() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Limpar toda a ficha? O rascunho local também será apagado.",
      )
    ) {
      return;
    }

    clearCharacterSheetDraft();
    reset(createEmptyCharacterSheet());
    setPage(1);
  }

  if (!isClient) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Carregando ficha…
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <CharacterSheetToolbar
        page={page}
        onPageChange={setPage}
        characterName={sheet.characterName}
        sheet={sheet}
        lastSavedAt={lastSavedAt}
        onClear={handleClear}
        sectionLinks={page === 1 ? [...PAGE_ONE_SECTIONS] : undefined}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          {page === 1 ? (
            <CharacterSheetPageOne
              register={register}
              watch={watch}
              setValue={setValue}
            />
          ) : (
            <CharacterSheetPageTwo
              register={register}
              watch={watch}
              setValue={setValue}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-xs text-muted-foreground">
        Rascunho salvo automaticamente neste navegador. Nada vai para o
        servidor.
      </p>
    </form>
  );
}
