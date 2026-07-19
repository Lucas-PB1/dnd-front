import { BackgroundDetailView } from "@/features/background-catalog/ui/background-detail-view";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BackgroundDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <BackgroundDetailView slug={slug} />
      </PageMain>
    </div>
  );
}
