import { CharacterSheetView } from "@/features/character-sheet/ui/character-sheet-view";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain width="sheet" className="gap-0">
        <CharacterSheetView id={id} />
      </PageMain>
    </div>
  );
}
