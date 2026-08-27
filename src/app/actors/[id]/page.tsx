import { ActorSheetView } from "@/features/actor/ui/actor-sheet-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ActorDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ActorSheetView id={id} />;
}
