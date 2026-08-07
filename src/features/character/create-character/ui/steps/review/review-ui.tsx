"use client";

import type { ReactNode } from "react";

export function ReviewChipList({
  items,
}: {
  items: { key: string; label: string; hint?: string }[];
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Nenhum</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item.key}
          className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs"
        >
          <span className="font-medium">{item.label}</span>
          {item.hint ? (
            <span className="text-muted-foreground"> · {item.hint}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ReviewField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export {
  SPELL_LIST_LABEL,
} from "@/features/character/create-character/lib/review/review-labels";
