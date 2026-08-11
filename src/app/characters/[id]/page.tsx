import { CharacterSheetView } from "@/features/character/character-sheet/ui/sheet/character-sheet-view";
import { AppPageShell } from "@/shared/ui/app-page-shell";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppPageShell
      width="sheet"
      className="min-h-dvh"
      mainClassName="gap-0 py-3 sm:py-4"
    >
      <CharacterSheetView id={id} />
    </AppPageShell>
  );
}
