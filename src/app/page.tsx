import Link from "next/link";
import {
  BookOpenIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { BRAND_NAME } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";
import { Atmosphere } from "@/shared/ui/atmosphere";
import { InkFlourish, SealMark } from "@/shared/ui/brand-marks";
import { buttonVariants } from "@/shared/ui/button";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { DndApiStatus } from "@/widgets/system-status/ui/dnd-api-status";
import { HealthStatus } from "@/widgets/system-status/ui/health-status";

export default function Home() {
  const showDevStatus = process.env.NODE_ENV === "development";

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      <Atmosphere />

      <AppHeader />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center sm:gap-6">
        <SealMark className="motion-brand size-14 sm:size-16" title="Selo Taverna" />
        <div className="space-y-2">
          <p className="motion-brand font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            {BRAND_NAME}
          </p>
          <InkFlourish className="motion-enter motion-delay-1 mx-auto h-4 w-44 sm:w-56" />
        </div>
        <p className="motion-enter motion-delay-1 font-heading text-sm font-medium tracking-[0.2em] text-secondary uppercase">
          Grimoire · PHB 2024 · Valdas · Eldritch Hunt
        </p>
        <h1 className="motion-enter motion-delay-1 max-w-lg font-sans text-lg font-medium text-foreground/90 sm:text-xl">
          Fichas prontas para a mesa
        </h1>
        <p className="motion-enter motion-delay-2 max-w-md text-base text-muted-foreground">
          Monte personagens com PHB 2024, Valdas e Eldritch Hunt, consulte o
          compêndio e jogue com a ficha ao lado.
        </p>
        <div className="motion-enter motion-delay-3 flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/compendium"
            className={cn(
              buttonVariants({ size: "lg" }),
              "motion-hover-lift inline-flex items-center gap-2",
            )}
          >
            <BookOpenIcon className="size-4" aria-hidden />
            Abrir compêndio
          </Link>
          <Link
            href="/characters"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "motion-hover-lift inline-flex items-center gap-2",
            )}
          >
            <UserGroupIcon className="size-4" aria-hidden />
            Minhas fichas
          </Link>
          <Link
            href="/characters/new"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "motion-hover-lift inline-flex items-center gap-2",
            )}
          >
            <PlusIcon className="size-4" aria-hidden />
            Criar personagem
          </Link>
        </div>
      </main>

      {showDevStatus ? (
        <footer className="motion-fade motion-delay-4 relative border-t border-border/60 px-6 py-3">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
            <HealthStatus />
            <DndApiStatus />
          </div>
        </footer>
      ) : null}
    </div>
  );
}
