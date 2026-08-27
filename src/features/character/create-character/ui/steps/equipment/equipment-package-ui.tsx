"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import {
  BanknotesIcon,
  CubeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import type { EquipmentLine } from "@/features/character/create-character/lib/equipment";
import { ItemCatalogDetailTrigger } from "@/features/catalog/item-catalog/ui/item-catalog-detail-trigger";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

export { ChoicePickers } from "@/features/character/create-character/ui/steps/equipment/equipment-package-choice-pickers";

export function SelectionStatus({
  label,
  ready,
  detail,
}: {
  label: string;
  ready: boolean;
  detail: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2",
        ready
          ? "border-primary/40 bg-primary/5"
          : "border-dashed border-border/80 bg-muted/10",
      )}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          ready
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
        aria-hidden
      >
        {ready ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CubeIcon className="size-3.5" />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function SummaryBlock({
  title,
  lines,
}: {
  title: string;
  lines: EquipmentLine[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-foreground/90">{title}</p>
      <EquipmentChips lines={lines} />
    </div>
  );
}

export function PackageCard({
  name,
  selected,
  title,
  badge,
  badgeTone,
  lines,
  onSelect,
}: {
  name: string;
  selected: boolean;
  title: string;
  badge: string;
  badgeTone: "default" | "gold";
  lines: EquipmentLine[];
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col gap-2.5 rounded-xl border p-3 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "hover:border-ring/60 hover:bg-muted/20",
        motion.hoverLift,
      )}
    >
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <span className="font-heading text-sm font-semibold tracking-tight">
            {title}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
              badgeTone === "gold"
                ? "bg-secondary/25 text-secondary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {badgeTone === "gold" ? (
              <BanknotesIcon className="size-3" aria-hidden />
            ) : (
              <CubeIcon className="size-3" aria-hidden />
            )}
            {badge}
          </span>
        </div>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background",
          )}
          aria-hidden
        >
          {selected ? <CheckIcon className="size-3" /> : null}
        </span>
      </div>

      <EquipmentChips lines={lines} />
    </label>
  );
}

function equipmentChipClassName(line: EquipmentLine) {
  return cn(
    "inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-[11px] leading-snug",
    line.kind === "gold" &&
      "border-secondary/40 bg-secondary/15 text-foreground",
    (line.kind === "pick-tool" || line.kind === "mirror-tool") &&
      "border-accent/30 bg-accent/10 text-foreground",
    line.kind === "item" &&
      "border-border/80 bg-background/80 text-foreground/90",
    line.kind === "text" &&
      "border-border/60 bg-muted/40 text-muted-foreground",
  );
}

function equipmentChipLabel(line: EquipmentLine) {
  if (line.kind === "pick-tool") return `Escolher: ${line.label}`;
  if (line.kind === "mirror-tool") return `Usar proficiência: ${line.label}`;
  return line.label;
}

export function EquipmentChips({ lines }: { lines: EquipmentLine[] }) {
  if (lines.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Sem itens listados.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {lines.map((line, index) => {
        const label = equipmentChipLabel(line);
        const chipClass = equipmentChipClassName(line);
        const canOpenDetail = line.kind === "item" && Boolean(line.itemSlug);

        return (
          <li key={`${line.kind}-${line.label}-${index}`}>
            {canOpenDetail ? (
              <ItemCatalogDetailTrigger
                item={{ slug: line.itemSlug!, name: label }}
                variant="text"
                className={cn(
                  chipClass,
                  "cursor-pointer underline-offset-2 hover:border-primary/50 hover:underline",
                )}
              />
            ) : (
              <span className={chipClass}>
                {line.kind === "pick-tool" || line.kind === "mirror-tool" ? (
                  <SparklesIcon
                    className="size-3 shrink-0 text-accent"
                    aria-hidden
                  />
                ) : null}
                {line.kind === "gold" ? (
                  <BanknotesIcon
                    className="size-3 shrink-0 text-secondary-foreground"
                    aria-hidden
                  />
                ) : null}
                <span className="min-w-0 truncate">{label}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
