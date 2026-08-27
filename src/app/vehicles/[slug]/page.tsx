import { VehicleTemplateDetailView } from "@/features/catalog/vehicle-template-catalog/ui/vehicle-template-detail-view";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <VehicleTemplateDetailView slug={slug} />
      </PageMain>
    </div>
  );
}
