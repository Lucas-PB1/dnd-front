import Link from "next/link";

import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const SECTIONS = [
  {
    href: "/classes",
    title: "Classes",
    description: "Guerreiro, mago, clérigo… — dado de vida e perícias",
  },
  {
    href: "/species",
    title: "Espécies",
    description: "Anão, elfo, humano… — traços e deslocamento",
  },
  {
    href: "/backgrounds",
    title: "Antecedentes",
    description: "Acólito, soldado… — bônus e equipamento inicial",
  },
  {
    href: "/spells",
    title: "Magias",
    description: "Truques e círculos 1º–9º — escolas e componentes",
  },
] as const;

export function CompendiumHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto flex-col items-start gap-2 p-4 text-left whitespace-normal",
          )}
        >
          <span className="font-semibold">{section.title}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {section.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
