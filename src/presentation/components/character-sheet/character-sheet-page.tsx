import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CharacterSheetForm } from "@/presentation/components/character-sheet/character-sheet-form";
import { ThemeToggle } from "@/presentation/components/theme-toggle";

export function CharacterSheetPage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            ← Início
          </Link>
          <span className="font-semibold tracking-tight">
            Ficha de personagem
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <CharacterSheetForm />
      </main>
    </div>
  );
}
