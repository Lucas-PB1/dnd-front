import Link from "next/link";

import { CharactersList } from "@/features/characters/ui/characters-list";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export default function CharactersPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Minhas fichas
            </h1>
            <p className="text-sm text-muted-foreground">
              Dados da dnd-api com seu token Supabase.
            </p>
          </div>
          <Link
            href="/characters/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Nova ficha
          </Link>
        </div>

        <CharactersList />
      </main>
    </div>
  );
}
