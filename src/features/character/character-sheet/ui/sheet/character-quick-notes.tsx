"use client";

import { useState } from "react";
import { useCharacterNotes } from "../../api/use-character-notes";
import { Button } from "@/shared/ui/button";

type QuickNotesProps = {
  characterId: string;
};

export function CharacterQuickNotes({ characterId }: QuickNotesProps) {
    const { notes, isLoading, saveNotes, isSaving } = useCharacterNotes(characterId);
    const [localText, setLocalText] = useState<string | null>(null);
    const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const currentText = localText ?? notes ?? "";

  async function handleSave(): Promise<void> {
    await saveNotes(currentText);
    setSavedSuccess(true);
    setLocalText(null); 
    setTimeout(() => setSavedSuccess(false), 2000);
  }

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Carregando anotações…</p>;
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Anotações da Sessão</h3>
        {savedSuccess ? <span className="text-xs text-green-500">Salvo!</span> : null}
      </div>
      <textarea
        value={currentText}
        onChange={(e) => setLocalText(e.target.value)}
        placeholder="Escreva dicas do mestre, pistas ou lembretes..."
        rows={4}
        className="w-full rounded-md border border-border bg-background/50 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex justify-end">
        <Button size="xs" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Anotações"}
        </Button>
      </div>
    </div>
  );
}