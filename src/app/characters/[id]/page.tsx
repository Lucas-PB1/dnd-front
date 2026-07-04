import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { CharacterDetailView } from "@/features/characters/ui/character-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
        <CharacterDetailView id={id} />
      </main>
    </div>
  );
}
