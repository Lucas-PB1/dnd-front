import Link from "next/link";

import { CreateCharacterForm } from "@/features/create-character/ui/create-character-form";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export default function NewCharacterPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="space-y-1">
          <Link
            href="/characters"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Minhas fichas
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Nova ficha</h1>
          <p className="text-sm text-muted-foreground">
            Passo 1 — identidade via dnd-api (classe, espécie, antecedente).
          </p>
        </div>
        <CreateCharacterForm />
        <p className="text-sm text-muted-foreground">
          Quer só explorar o livro?{" "}
          <Link
            href="/compendium"
            className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
          >
            Abrir compêndio
          </Link>
        </p>
      </main>
    </div>
  );
}
