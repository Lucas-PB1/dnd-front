import Link from "next/link";

import { BRAND_NAME } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import { DndApiStatus } from "@/widgets/system-status/ui/dnd-api-status";
import { HealthStatus } from "@/widgets/system-status/ui/health-status";

export default function Home() {
  const showDevStatus = process.env.NODE_ENV === "development";

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.14_85_/_0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.45_0.18_25_/_0.12),_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.68_0.12_85_/_0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.62_0.18_290_/_0.14),_transparent_50%)]"
      />

      <AppHeader />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center sm:gap-6">
        <p className="font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          {BRAND_NAME}
        </p>
        <h1 className="max-w-lg font-sans text-lg font-medium text-foreground/90 sm:text-xl">
          Fichas prontas para a mesa
        </h1>
        <p className="max-w-md text-base text-muted-foreground">
          Monte personagens PHB 2024, consulte o compêndio e jogue com a ficha
          ao lado.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/compendium"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Compêndio PHB
          </Link>
          <Link
            href="/characters"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Minhas fichas
          </Link>
          <Link
            href="/characters/new"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            Criar ficha
          </Link>
        </div>
      </main>

      {showDevStatus ? (
        <footer className="relative border-t border-border/60 px-6 py-3">
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
            <HealthStatus />
            <DndApiStatus />
          </div>
        </footer>
      ) : null}
    </div>
  );
}
