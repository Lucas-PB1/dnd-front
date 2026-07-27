"use client";

import {
  Bars3Icon,
  BookOpenIcon,
  MapIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";

import { AuthNav } from "@/features/auth/ui/auth-nav";
import { BRAND_NAME } from "@/shared/config/brand";
import { cn } from "@/shared/lib/utils";
import { SealMark } from "@/shared/ui/brand-marks";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/widgets/app-header/ui/theme-toggle";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

const NAV_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  icon: NavIcon;
}> = [
  { href: "/compendium", label: "Compêndio", icon: BookOpenIcon },
  { href: "/characters", label: "Fichas", icon: UserGroupIcon },
  { href: "/campaigns", label: "Campanhas", icon: MapIcon },
];

function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: NavIcon;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
      {label}
    </Link>
  );
}

export function AppHeader({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={cn("border-b border-border/80", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 font-heading text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-secondary"
            onClick={() => setMenuOpen(false)}
          >
            <SealMark className="size-6" />
            {BRAND_NAME}
          </Link>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Principal"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <AuthNav />
          </div>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <XMarkIcon className="size-5" aria-hidden />
            ) : (
              <Bars3Icon className="size-5" aria-hidden />
            )}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="mx-auto max-w-7xl border-t border-border/60 px-4 py-3 md:hidden sm:px-6"
        >
          <nav className="flex flex-col gap-1" aria-label="Principal mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
          </nav>
          <div className="mt-3 border-t border-border/60 pt-3 sm:hidden">
            <AuthNav />
          </div>
        </div>
      ) : null}
    </header>
  );
}
