import Link from "next/link";

import { CreateCharacterWizard } from "@/features/create-character/ui/create-character-wizard";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { PageMain } from "@/shared/ui/page-main";
import { AppHeader } from "@/widgets/app-header/ui/app-header";

export default function NewCharacterPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <PageMain>
        <div className="space-y-1">
          <Link
            href="/characters"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Minhas fichas
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Nova ficha
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Assistente em etapas — identidade, atributos, perícias, equipamento
            e magias. A API valida e calcula PV, PB e perícias.
          </p>
        </div>
        <CreateCharacterWizard />
        <p className="text-sm text-muted-foreground">
          Quer só explorar o livro?{" "}
          <Link
            href="/compendium"
            className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
          >
            Abrir compêndio
          </Link>
        </p>
      </PageMain>
    </div>
  );
}
