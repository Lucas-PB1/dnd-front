import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HealthStatus } from "@/presentation/components/health-status";
import { ThemeToggle } from "@/presentation/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-semibold tracking-tight">dnd</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Campanhas &amp; fichas
        </h1>
        <p className="max-w-md text-muted-foreground">
          Stack pronta: Clean Architecture, Supabase, TanStack Query e tema
          Taverna / Masmorra.
        </p>
        <Link
          href="/character-sheet"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Nova ficha em branco
        </Link>
        <HealthStatus />
      </main>
    </div>
  );
}
