import Link from "next/link";

import { BRAND_NAME } from "@/shared/config/brand";
import { Atmosphere } from "@/shared/ui/atmosphere";
import { SealMark } from "@/shared/ui/brand-marks";
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
      <Atmosphere />

      <header className="relative flex items-center justify-between border-b border-border/80 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-xl font-semibold tracking-tight transition-colors hover:text-secondary"
        >
          <SealMark className="size-6" />
          {BRAND_NAME}
        </Link>
        <ThemeToggle />
      </header>

      <main className="motion-page relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div className="motion-enter flex flex-col items-center space-y-3 text-center">
          <SealMark className="size-12 text-secondary" />
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="motion-enter motion-delay-1">{children}</div>
      </main>
    </div>
  );
}
