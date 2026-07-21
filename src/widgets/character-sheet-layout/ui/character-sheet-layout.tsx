"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export type SheetNavItem = {
  id: string;
  label: string;
};

export type SheetNavGroup = {
  label: string;
  items: SheetNavItem[];
};

type CharacterSheetLayoutProps = {
  nav: SheetNavItem[] | SheetNavGroup[];
  children: ReactNode;
  header?: ReactNode;
  /** Barra de vitais (PV/CA) — sticky sob o header */
  vitals?: ReactNode;
  actions?: ReactNode;
};

function isNavGroup(
  nav: SheetNavItem[] | SheetNavGroup[],
): nav is SheetNavGroup[] {
  return nav.length > 0 && "items" in nav[0]!;
}

function flattenNav(nav: SheetNavItem[] | SheetNavGroup[]): SheetNavItem[] {
  if (isNavGroup(nav)) {
    return nav.flatMap((group) => group.items);
  }
  return nav;
}

function NavLinks({
  items,
  activeId,
}: {
  items: SheetNavItem[];
  activeId: string | null;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-primary/12 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function CharacterSheetLayout({
  nav,
  children,
  header,
  vitals,
  actions,
}: CharacterSheetLayoutProps) {
  const grouped = isNavGroup(nav);
  const flat = useMemo(() => flattenNav(nav), [nav]);
  const [activeId, setActiveId] = useState<string | null>(
    flat[0]?.id ?? null,
  );

  useEffect(() => {
    const ids = flat.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0),
          );
        const top = visible[0]?.target.id;
        if (top) setActiveId(top);
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [flat]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside className="hidden lg:sticky lg:top-6 lg:block lg:w-44 lg:shrink-0">
        <nav aria-label="Seções da ficha" className="space-y-4">
          {grouped ? (
            nav.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 text-[0.65rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  {group.label}
                </p>
                <NavLinks items={group.items} activeId={activeId} />
              </div>
            ))
          ) : (
            <NavLinks items={nav} activeId={activeId} />
          )}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        {header || actions ? (
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border/70",
              "bg-gradient-to-br from-card via-card/90 to-primary/[0.06]",
              "px-4 py-5 sm:px-6 sm:py-6",
              motion.enter,
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklch, var(--secondary) 35%, transparent), transparent 55%)",
              }}
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">{header}</div>
              {actions ? <div className="relative shrink-0">{actions}</div> : null}
            </div>
          </div>
        ) : null}

        {vitals ? (
          <div className="sticky top-2 z-20 sm:top-3">{vitals}</div>
        ) : null}

        {/* Nav horizontal no mobile */}
        <nav
          aria-label="Seções da ficha (mobile)"
          className="lg:hidden -mx-1 overflow-x-auto px-1 pb-1"
        >
          <ul className="flex w-max gap-1.5">
            {flat.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "block whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "border-primary/50 bg-primary/15 font-medium text-primary"
                        : "border-border/80 bg-card/60 text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={cn("space-y-4", motion.stagger)}>{children}</div>
      </div>
    </div>
  );
}
