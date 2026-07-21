import Link from "next/link";

import { BRAND_NAME } from "@/shared/config/brand";
import { ThemeToggle } from "@/widgets/app-header/ui/theme-toggle";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.14_85_/_0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.45_0.18_25_/_0.1),_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.68_0.12_85_/_0.1),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.62_0.18_290_/_0.12),_transparent_50%)]"
      />

      <header className="relative flex items-center justify-between border-b border-border/80 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight transition-colors hover:text-primary"
        >
          {BRAND_NAME}
        </Link>
        <ThemeToggle />
      </header>

      <main className="motion-page relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div className="motion-enter space-y-2 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="motion-enter motion-delay-1">{children}</div>
      </main>
    </div>
  );
}
