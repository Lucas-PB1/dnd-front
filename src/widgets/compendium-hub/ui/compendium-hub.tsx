import Link from "next/link";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookmarkIcon,
  CubeIcon,
  GlobeAltIcon,
  LanguageIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { MarginCorner, SealMark } from "@/shared/ui/brand-marks";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const SECTIONS: ReadonlyArray<{
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: HeroIcon;
}> = [
  {
    href: "/classes",
    title: "Classes",
    eyebrow: "Arquétipos",
    description:
      "Do bárbaro ao mago — dado de vida, atributos e o papel de cada um na mesa.",
    icon: ShieldCheckIcon,
  },
  {
    href: "/species",
    title: "Espécies",
    eyebrow: "Origens",
    description:
      "Anão, elfo, humano e mais — traços, tamanho e o legado de cada povo.",
    icon: GlobeAltIcon,
  },
  {
    href: "/backgrounds",
    title: "Antecedentes",
    eyebrow: "História",
    description:
      "De onde você veio — talento de origem, perícias e equipamento inicial.",
    icon: BookmarkIcon,
  },
  {
    href: "/skills",
    title: "Perícias",
    eyebrow: "Competências",
    description:
      "As dezoito perícias — atributo ligado e quando usá-las na mesa.",
    icon: AcademicCapIcon,
  },
  {
    href: "/feats",
    title: "Talentos",
    eyebrow: "Especialização",
    description:
      "Origem, geral e estilo de luta — pré-requisitos e benefícios do PHB.",
    icon: SparklesIcon,
  },
  {
    href: "/subclasses",
    title: "Subclasses",
    eyebrow: "Arquétipos",
    description:
      "Caminhos de cada classe — tagline, resumo e características por nível.",
    icon: Squares2X2Icon,
  },
  {
    href: "/equipment",
    title: "Equipamento",
    eyebrow: "Arsenal",
    description: "Armas, armaduras e itens — dano, CA, custo e propriedades.",
    icon: CubeIcon,
  },
  {
    href: "/languages",
    title: "Idiomas",
    eyebrow: "Línguas",
    description:
      "Comuns e raras — escrita, falantes típicos e raridade no PHB.",
    icon: LanguageIcon,
  },
  {
    href: "/spells",
    title: "Magias",
    eyebrow: "Arcano",
    description:
      "Truques aos círculos superiores — escolas, componentes e duração.",
    icon: SparklesIcon,
  },
];

export function CompendiumHub() {
  return (
    <div className="space-y-8">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border",
          motion.enter,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_80%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%),radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--accent)_10%,transparent),transparent_48%)]"
          aria-hidden
        />
        <MarginCorner className="pointer-events-none absolute top-3 left-3 size-10" />
        <MarginCorner
          mirror
          className="pointer-events-none absolute top-3 right-3 size-10"
        />
        <div className="relative space-y-3 p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <SealMark className="size-5" />
            <p className="text-xs font-medium tracking-wider text-secondary uppercase">
              Livro do Jogador 2024
            </p>
          </div>
          <p className="max-w-2xl font-heading text-lg leading-snug text-foreground/90 sm:text-xl">
            Explore o catálogo público — sem login. Escolha uma seção para ler
            arquétipos, perícias, talentos, subclasses, equipamento e magias.
          </p>
        </div>
      </div>

      <ul className={cn("flex flex-col border-t border-border", motion.stagger)}>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className={cn(
                  "group flex items-start justify-between gap-4 border-b border-border px-1 py-5",
                  "hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  motion.hoverRow,
                )}
              >
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/40 text-accent transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <Icon className="size-5" aria-hidden />
                  </span>
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
                </div>
                <ArrowRightIcon
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
