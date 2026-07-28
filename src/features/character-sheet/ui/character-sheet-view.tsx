"use client";

import { useCharacterSheetView } from "@/features/character-sheet/lib/use-character-sheet-view";
import {
  CharacterSheetErrorState,
  CharacterSheetHeader,
} from "@/features/character-sheet/ui/character-sheet-header";
import { CharacterSheetMainGrid } from "@/features/character-sheet/ui/character-sheet-main-grid";
import { buildCharacterSheetTabPanels } from "@/features/character-sheet/ui/character-sheet-tab-panels";
import { SheetRollsProvider } from "@/features/character-sheet/ui/beyond/sheet-rolls";
import { SheetEditDialog } from "@/features/character-sheet/ui/sheet-edit-dialog";
import { buildSheetEditDialogs } from "@/features/character-sheet/ui/sheet-edit-dialog-registry";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

type CharacterSheetViewProps = {
  id: string;
};

export function CharacterSheetView({ id }: CharacterSheetViewProps) {
  const sheet = useCharacterSheetView(id);

  if (sheet.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando ficha…</p>;
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
  const tabPanels = buildCharacterSheetTabPanels({
    characterId: id,
    character: sheet.data,
    labels: sheet.labels,
    sectionProps: sheet.sectionProps,
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
          onEditIdentity={() => sheet.setEditing("identity")}
        />

        <CharacterSheetMainGrid
          characterId={id}
          character={sheet.data}
          languageNames={sheet.languageNames}
          skillsQuery={sheet.skillsQuery}
          tabPanels={tabPanels}
          onEditSkills={() => sheet.setEditing("skills")}
          onEditAbilities={() => sheet.setEditing("abilities")}
        />

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
