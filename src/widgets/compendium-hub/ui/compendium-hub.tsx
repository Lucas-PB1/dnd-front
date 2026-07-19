import Link from "next/link";

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
    <ul className="grid gap-3 sm:grid-cols-2">
      {SECTIONS.map((section) => (
        <li key={section.href}>
          <Link
            href={section.href}
            className={cn(
              "group flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-5 text-left transition-colors",
              "hover:border-ring hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            )}
          >
            <span className="font-heading text-xl font-semibold tracking-tight group-hover:text-primary">
              {section.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {section.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
