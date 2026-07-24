import { CharacterSheetView } from "@/features/character-sheet/ui/character-sheet-view";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader className="shrink-0" />
      <PageMain width="sheet" muteMotion className="gap-0 py-3 sm:py-4">
        <CharacterSheetView id={id} />
      </PageMain>
    </div>
  );
}
