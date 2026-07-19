import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { cn } from "@/shared/lib/utils";

const SECTIONS = [
  {
    href: "/classes",
    title: "Classes",
    eyebrow: "Arquétipos",
    description:
      "Do bárbaro ao mago — dado de vida, atributos e o papel de cada um na mesa.",
  },
  {
    href: "/species",
    title: "Espécies",
    eyebrow: "Origens",
    description:
      "Anão, elfo, humano e mais — traços, tamanho e o legado de cada povo.",
  },
  {
    href: "/backgrounds",
    title: "Antecedentes",
    eyebrow: "História",
    description:
      "De onde você veio — talento de origem, perícias e equipamento inicial.",
  },
  {
    href: "/feats",
    title: "Talentos",
    eyebrow: "Especialização",
    description:
      "Origem, geral e estilo de luta — pré-requisitos e benefícios do PHB.",
  },
  {
    href: "/equipment",
    title: "Equipamento",
    eyebrow: "Arsenal",
    description: "Armas, armaduras e itens — dano, CA, custo e propriedades.",
  },
  {
    href: "/spells",
    title: "Magias",
    eyebrow: "Arcano",
    description:
      "Truques aos círculos superiores — escolas, componentes e duração.",
  },
] as const;

export function CompendiumHub() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl border border-border">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_12%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div className="relative space-y-2 p-5 sm:p-7">
          <p className="text-xs font-medium tracking-wider text-primary uppercase">
            Livro do Jogador 2024
          </p>
          <p className="max-w-2xl font-heading text-lg leading-snug text-foreground/90 sm:text-xl">
            Explore o catálogo público — sem login. Escolha uma seção para ler
            arquétipos, origens, talentos, equipamento e magias.
          </p>
        </div>
      </div>

      <ul className="flex flex-col border-t border-border">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className={cn(
                "group flex items-start justify-between gap-4 border-b border-border px-1 py-5 transition-colors",
                "hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              )}
            >
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
                  {section.eyebrow}
                </p>
                <h2 className="font-heading text-xl font-semibold tracking-tight group-hover:text-primary sm:text-2xl">
                  {section.title}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {section.description}
                </p>
              </div>
              <ArrowRightIcon
                className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
