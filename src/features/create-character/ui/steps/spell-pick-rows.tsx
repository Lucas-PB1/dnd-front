"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";

import type { ClassSpellOption } from "@/entities/class/types";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function SpellBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{title}</p>
      <ul className="grid gap-1.5 sm:grid-cols-2">{children}</ul>
    </div>
  );
}

function SpellMeta({ spell }: { spell: ClassSpellOption }) {
  return (
    <span className="min-w-0">
      <span className="font-medium">{spell.name}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        {spell.level === 0 ? "Truque" : `Círculo ${spell.level}`} ·{" "}
        {spell.schoolName}
      </span>
    </span>
  );
}

export function PreviewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
      aria-label="Ver descrição da magia"
      onClick={onClick}
    >
      <BookOpenIcon className="size-3.5" aria-hidden />
    </Button>
  );
}

export function SimpleSpellRow({
  spell,
  checked,
  disabled = false,
  onToggle,
  onPreview,
}: {
  spell: ClassSpellOption;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onPreview: () => void;
}) {
  return (
    <li className="list-none">
      <div
        className={cn(
          "flex h-full items-start gap-1 rounded-lg border px-2 py-2 text-sm",
          checked && "border-primary bg-primary/5",
          disabled && "opacity-50",
        )}
      >
        <label
          className={cn(
            "flex min-w-0 flex-1 items-start gap-2 px-1 py-0.5",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={checked}
            disabled={disabled}
            onChange={onToggle}
          />
          <SpellMeta spell={spell} />
        </label>
        <PreviewButton onClick={onPreview} />
      </div>
    </li>
  );
}

export function WizardSpellRow({
  spell,
  entry,
  knownDisabled = false,
  preparedDisabled = false,
  onKnown,
  onPrepared,
  onPreview,
}: {
  spell: ClassSpellOption;
  entry?: { listType: string };
  knownDisabled?: boolean;
  preparedDisabled?: boolean;
  onKnown: () => void;
  onPrepared: () => void;
  onPreview: () => void;
}) {
  const inBook = entry?.listType === "known" || entry?.listType === "prepared";
  const prepared = entry?.listType === "prepared";

  return (
    <li className="list-none sm:col-span-2">
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
          inBook && "border-primary/50 bg-primary/5",
          knownDisabled && !inBook && "opacity-50",
        )}
      >
        <div className="flex min-w-0 items-start gap-1">
          <SpellMeta spell={spell} />
          <PreviewButton onClick={onPreview} />
        </div>
        <div className="flex shrink-0 gap-3 text-xs">
          <label
            className={cn(
              "flex items-center gap-1.5",
              knownDisabled && !inBook && "cursor-not-allowed",
            )}
          >
            <input
              type="checkbox"
              checked={inBook}
              disabled={knownDisabled && !inBook}
              onChange={onKnown}
            />
            Grimório
          </label>
          <label
            className={cn(
              "flex items-center gap-1.5",
              (!inBook || (preparedDisabled && !prepared)) && "opacity-40",
            )}
          >
            <input
              type="checkbox"
              checked={prepared}
              disabled={!inBook || (preparedDisabled && !prepared)}
              onChange={onPrepared}
            />
            Preparada
          </label>
        </div>
      </div>
    </li>
  );
}
