import Link from "next/link";

import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { DndApiStatus } from "@/widgets/system-status/ui/dnd-api-status";
import { HealthStatus } from "@/widgets/system-status/ui/health-status";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Campanhas &amp; fichas
        </h1>
        <p className="max-w-md text-muted-foreground">
          Stack: Feature-Sliced Design, Supabase Auth, TanStack Query, tema
          Taverna / Masmorra — dados PHB via{" "}
          <strong className="font-medium">dnd-api</strong>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/classes" className={cn(buttonVariants({ size: "lg" }))}>
            Compêndio — classes
          </Link>
          <Link
            href="/character-sheet"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Nova ficha em branco
          </Link>
          <Link
            href="/characters"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Minhas fichas
          </Link>
        </div>
        <HealthStatus />
        <DndApiStatus />
      </main>
    </div>
  );
}
