"use client";

import { useCharacterSheetView } from "@/features/character/character-sheet/lib/sheet/use-character-sheet-view";
import {
  CharacterSheetErrorState,
  CharacterSheetHeader,
} from "@/features/character/character-sheet/ui/sheet/character-sheet-header";
import { CharacterSheetLoadingSkeleton } from "@/features/character/character-sheet/ui/sheet/character-sheet-loading";
import { CharacterSheetMainGrid } from "@/features/character/character-sheet/ui/sheet/character-sheet-main-grid";
import { buildCharacterSheetPagePanels } from "@/features/character/character-sheet/ui/sheet/character-sheet-tab-panels";
import { SheetRollsProvider } from "@/features/character/character-sheet/ui/beyond/layout/sheet-rolls";
import { SheetEditDialog } from "@/features/character/character-sheet/ui/edit/sheet-edit-dialog";
import { buildSheetEditDialogs } from "@/features/character/character-sheet/ui/edit/sheet-edit-dialog-registry";
import { SheetSettingsDialog } from "@/features/character/character-sheet/ui/edit/sheet-settings-dialog";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

type CharacterSheetViewProps = {
  id: string;
};

export function CharacterSheetView({ id }: CharacterSheetViewProps) {
  const sheet = useCharacterSheetView(id);

  if (sheet.isPending) {
    return <CharacterSheetLoadingSkeleton summary={sheet.listSummary} />;
  }

  if (sheet.isError || !sheet.data || !sheet.sectionProps || !sheet.editForms) {
    return (
      <CharacterSheetErrorState
        message={
          sheet.error instanceof Error
            ? sheet.error.message
            : "Ficha não encontrada"
        }
      />
    );
  }

  const editDialogs = buildSheetEditDialogs(sheet.editForms);
  const activeEdit = sheet.editing ? editDialogs[sheet.editing] : null;
  const pagePanels = buildCharacterSheetPagePanels({
    characterId: id,
    character: sheet.data,
    labels: sheet.labels,
    onEdit: sheet.setEditing,
  });

  return (
    <SheetRollsProvider characterId={id}>
      <div
        className={cn(
          "flex flex-col gap-2.5 pb-6 sm:gap-3 sm:pb-8",
          motion.enter,
        )}
      >
        <CharacterSheetHeader
          characterId={id}
          character={sheet.data}
          labels={sheet.labels}
          onOpenSettings={sheet.openSettings}
        />

        <CharacterSheetMainGrid
          characterId={id}
          character={sheet.data}
          languageNames={sheet.languageNames}
          skillsQuery={sheet.skillsQuery}
          pagePanels={pagePanels}
          activeSection={sheet.activeSection}
          onActiveSectionChange={sheet.setActiveSection}
          onEditSkills={() => sheet.setEditing("skills")}
          onEditAbilities={() => sheet.setEditing("abilities")}
        />

        {sheet.settingsOpen ? (
          <SheetSettingsDialog
            characterId={id}
            character={sheet.data}
            onClose={sheet.closeSettings}
          />
        ) : null}

        {activeEdit ? (
          <SheetEditDialog
            onClose={sheet.closeEdit}
            title={activeEdit.title}
            description={activeEdit.description}
            width={activeEdit.width}
          >
            {activeEdit.content}
          </SheetEditDialog>
        ) : null}
      </div>
    </SheetRollsProvider>
  );
}
