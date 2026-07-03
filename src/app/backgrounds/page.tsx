import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { BackgroundsGrid } from "@/features/background-catalog/ui/backgrounds-grid";

export default function BackgroundsPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Antecedentes
          </h1>
          <p className="text-sm text-muted-foreground">PHB 2024 — dnd-api</p>
        </div>
        <BackgroundsGrid />
      </main>
    </div>
  );
}
