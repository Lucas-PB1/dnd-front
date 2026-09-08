import { DuelDetailView } from "@/features/duel/duels/ui/detail/duel-detail-view";
import { AppPageShell } from "@/shared/ui/app-page-shell";

export default async function DuelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppPageShell>
      <DuelDetailView duelId={id} />
    </AppPageShell>
  );
}
