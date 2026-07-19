import Link from "next/link";

import { CharactersList } from "@/features/characters/ui/characters-list";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

export default function CharactersPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Minhas fichas
            </h1>
            <p className="text-sm text-muted-foreground">
              Personagens salvos na sua conta.
            </p>
          </div>
          <Link
            href="/characters/new"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Nova ficha
          </Link>
        </div>

        <CharactersList />
      </main>
    </div>
  );
}
