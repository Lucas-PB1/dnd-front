import { FightingStyleDetailView } from "@/features/fighting-style-catalog/ui/fighting-style-detail-view";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FightingStyleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <FightingStyleDetailView slug={slug} />
      </PageMain>
    </div>
  );
}
