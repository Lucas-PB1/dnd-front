import Link from "next/link";

import { CharactersList } from "@/features/characters/ui/characters-list";
import { TempTestPresetsPanel } from "@/features/create-character/ui/temp-test-presets-panel";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

export default function CharactersPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />

      <PageMain>
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

        <TempTestPresetsPanel />

        <CharactersList />
      </PageMain>
    </div>
  );
}
