"use client";

import {
  ArrowUpCircleIcon,
  LanguageIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import type { CharacterDetail } from "@/entities/character/types";
import { EditLanguagesInlineForm } from "@/features/character/character-sheet/ui/edit/edit-languages-inline-form";
import { EditProfileForm } from "@/features/character/character-sheet/ui/edit/edit-profile-form";
import { LevelUpSection } from "@/features/character/character-sheet/ui/level-up/level-up-section";
import { CharacterSheetTabSection } from "@/features/character/character-sheet/ui/sheet/character-sheet-tab-section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type SheetSettingsDialogProps = {
  characterId: string;
  character: CharacterDetail;
  onClose: () => void;
};

/**
 * Hub de Ajustes: metadados leves + progressão + idiomas.
 * Aberto por botão no header (não é aba do painel Beyond).
 */
export function SheetSettingsDialog({
  characterId,
  character,
  onClose,
}: SheetSettingsDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="flex max-h-[min(92vh,52rem)] min-h-0 flex-col gap-0 overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Ajustes</DialogTitle>
          <DialogDescription>
            Personagem, subir de nível e idiomas — sem trocar classe ou espécie.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-1 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 pt-2 pb-1">
          <CharacterSheetTabSection title="Personagem" icon={UserIcon}>
            <EditProfileForm
              key={`profile-${character.name}-${character.alignmentSlug ?? ""}`}
              character={character}
              onSuccess={() => {
                /* invalidação via mutation; permanece no hub */
              }}
            />
          </CharacterSheetTabSection>
          <CharacterSheetTabSection
            title="Subir de nível"
            icon={ArrowUpCircleIcon}
          >
            <LevelUpSection
              characterId={characterId}
              character={character}
            />
          </CharacterSheetTabSection>
          <CharacterSheetTabSection title="Idiomas" icon={LanguageIcon}>
            <EditLanguagesInlineForm
              key={`langs-${character.languageSlugs.join(",")}`}
              character={character}
              onSuccess={() => {
                /* invalidação via mutation; permanece no hub */
              }}
            />
          </CharacterSheetTabSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}
