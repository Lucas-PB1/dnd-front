"use client";

import type { ReactNode } from "react";

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
  actions?: ReactNode;
};

function isNavGroup(
  nav: SheetNavItem[] | SheetNavGroup[],
): nav is SheetNavGroup[] {
  return nav.length > 0 && "items" in nav[0]!;
}

function NavLinks({ items }: { items: SheetNavItem[] }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={cn(
              "block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CharacterSheetLayout({
  nav,
  children,
  header,
  actions,
}: CharacterSheetLayoutProps) {
  const grouped = isNavGroup(nav);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside className="lg:sticky lg:top-6 lg:w-48 lg:shrink-0">
        <nav aria-label="Seções da ficha" className="space-y-4">
          {grouped ? (
            nav.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
                <NavLinks items={group.items} />
              </div>
            ))
          ) : (
            <NavLinks items={nav} />
          )}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-5">
        {header ? (
          <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">{header}</div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
