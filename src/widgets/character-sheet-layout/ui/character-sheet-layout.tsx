"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export type SheetNavItem = {
  id: string;
  label: string;
};

type CharacterSheetLayoutProps = {
  nav: SheetNavItem[];
  children: ReactNode;
  header?: ReactNode;
  actions?: ReactNode;
};

export function CharacterSheetLayout({
  nav,
  children,
  header,
  actions,
}: CharacterSheetLayoutProps) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside className="lg:sticky lg:top-6 lg:w-44 lg:shrink-0">
        <nav aria-label="Seções da ficha" className="flex flex-col gap-1">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        {header ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">{header}</div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
