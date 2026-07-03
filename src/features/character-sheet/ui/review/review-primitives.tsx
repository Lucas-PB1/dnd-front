import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";

export function displayReviewValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function ReviewField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

export function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ReviewText({ label, value }: { label: string; value: string }) {
  const text = displayReviewValue(value);
  if (text === "—") {
    return null;
  }

  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{text}</p>
    </div>
  );
}

export type ReviewSectionProps = {
  sheet: CharacterSheet;
};
