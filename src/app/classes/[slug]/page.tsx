import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ClassDetailView } from "@/features/class-catalog/ui/class-detail-view";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
        <ClassDetailView slug={slug} />
      </main>
    </div>
  );
}
