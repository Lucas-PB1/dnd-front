"use client";

import { useState } from "react";

import { useCharacterNotes } from "@/features/character/character-sheet/api/use-character-notes";
import { Button } from "@/shared/ui/button";

type QuickNotesProps = {
  characterId: string;
};

export function CharacterQuickNotes({ characterId }: QuickNotesProps) {
  const { notes, isLoading, loadError, saveNotes, isSaving, saveError } =
    useCharacterNotes(characterId);
  const [localText, setLocalText] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentText = localText ?? notes ?? "";
  const isDirty = localText != null && localText !== notes;

  async function handleSave(): Promise<void> {
    try {
      await saveNotes(currentText);
      setSavedSuccess(true);
      setLocalText(null);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      // saveError já expõe a mensagem
    }
  }

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground">Carregando anotações…</p>
    );
  }

  if (loadError) {
    return (
      <p className="text-xs text-destructive" role="alert">
        {loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as anotações."}
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-border/70 bg-card/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Anotações da Sessão</h3>
        {savedSuccess ? (
          <span className="text-xs text-green-600 dark:text-green-400">
            Salvo!
          </span>
        ) : isDirty ? (
          <span className="text-xs text-muted-foreground">Alterações não salvas</span>
        ) : null}
      </div>
      <textarea
        value={currentText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder="Escreva dicas do mestre, pistas ou lembretes..."
        rows={4}
        disabled={isSaving}
        className="w-full rounded-md border border-border bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
      />
      {saveError ? (
        <p className="text-xs text-destructive" role="alert">
          {saveError instanceof Error
            ? saveError.message
            : "Falha ao salvar anotações."}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          size="xs"
          onClick={() => void handleSave()}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? "Salvando..." : "Salvar Anotações"}
        </Button>
      </div>
    </div>
  );
}
