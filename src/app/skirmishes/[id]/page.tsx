import { SkirmishDetailView } from "@/features/skirmish/skirmishes/ui/detail/skirmish-detail-view";
import { AppPageShell } from "@/shared/ui/app-page-shell";

export default async function SkirmishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppPageShell>
      <SkirmishDetailView skirmishId={id} />
    </AppPageShell>
  );
}
