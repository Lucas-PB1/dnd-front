import Link from "next/link";

import { CreateCharacterWizard } from "@/features/create-character/ui/create-character-wizard";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

export default function NewCharacterPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain className="gap-4 py-4 sm:py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <BackLink href="/characters">Fichas</BackLink>
            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Nova ficha
            </h1>
          </div>
          <Link
            href="/compendium"
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto p-0 text-sm text-muted-foreground",
            )}
          >
            Compêndio
          </Link>
        </div>
        <CreateCharacterWizard />
      </PageMain>
    </div>
  );
}
