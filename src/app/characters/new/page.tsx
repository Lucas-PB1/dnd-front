import Link from "next/link";

import { CreateCharacterWizard } from "@/features/character/create-character/ui/wizard/create-character-wizard";
import { cn } from "@/shared/lib/utils";
import { AppPageShell } from "@/shared/ui/app-page-shell";
import { buttonVariants } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/catalog-page-header";

export default function NewCharacterPage() {
  return (
    <AppPageShell mainClassName="gap-4 py-4 sm:py-6">
      <PageHeader
        title="Nova ficha"
            description="Monte o personagem passo a passo — regras PHB 2024, Valdas e Eldritch Hunt."
        backHref="/characters"
        backLabel="Fichas"
        actions={
          <Link
            href="/compendium"
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto p-0 text-sm text-muted-foreground",
            )}
          >
            Compêndio
          </Link>
        }
      />
      <CreateCharacterWizard />
    </AppPageShell>
  );
}
