import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { ClassesGrid } from "@/features/class-catalog/ui/classes-grid";

export default function ClassesPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo PHB 2024 — dados da dnd-api, sem autenticação.
          </p>
        </div>

        <ClassesGrid />
      </main>
    </div>
  );
}
