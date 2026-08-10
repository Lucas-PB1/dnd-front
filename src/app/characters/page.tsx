import Link from "next/link";

import { CharactersList } from "@/features/character/characters/ui/characters-list";
import { cn } from "@/shared/lib/utils";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { buttonVariants } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/catalog-page-header";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

export default function CharactersPage() {
  return (
    <AppPageShell>
      <PageHeader
        title="Minhas fichas"
        description="Personagens salvos na sua conta — também podem entrar em campanhas."
        meta={<SourceEditionBadge live />}
        actions={
          <Link
            href="/characters/new"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Nova ficha
          </Link>
        }
      />
      <CharactersList />
    </AppPageShell>
  );
}
