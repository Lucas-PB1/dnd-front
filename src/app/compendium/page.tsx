import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { CompendiumHub } from "@/widgets/compendium-hub/ui/compendium-hub";

export default function CompendiumPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Compêndio PHB
          </h1>
          <p className="text-sm text-muted-foreground">
            Catálogo da dnd-api — leitura pública, sem login.
          </p>
        </div>
        <CompendiumHub />
      </main>
    </div>
  );
}
