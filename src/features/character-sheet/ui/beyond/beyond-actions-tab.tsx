"use client";

type ActionEconomyBucket = "action" | "bonus" | "reaction" | "free";

const SECTIONS: {
  bucket: ActionEconomyBucket;
  title: string;
  emptyMessage: string;
}[] = [
  {
    bucket: "action",
    title: "Ação",
    emptyMessage: "Nenhuma ação catalogada ainda.",
  },
  {
    bucket: "bonus",
    title: "Ação Bônus",
    emptyMessage: "Nenhuma ação bônus catalogada.",
  },
  {
    bucket: "reaction",
    title: "Reação",
    emptyMessage: "Nenhuma reação catalogada.",
  },
  {
    bucket: "free",
    title: "Ação Livre",
    emptyMessage: "Nenhuma ação livre catalogada.",
  },
];

/** Economia de ação na mesa — sem inventário (isso fica na aba Inventário). */
export function BeyondActionsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-tight">Ações</h3>
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <ActionEconomySection key={section.bucket} {...section} />
        ))}
      </div>
    </div>
  );
}

function ActionEconomySection({
  bucket,
  title,
  emptyMessage,
}: {
  bucket: ActionEconomyBucket;
  title: string;
  emptyMessage: string;
}) {
  return (
    <section className="space-y-1.5" aria-labelledby={`actions-${bucket}`}>
      <div className="flex items-center gap-2">
        <h4
          id={`actions-${bucket}`}
          className="text-[0.7rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
        >
          {title}
          <span className="ml-1.5 font-mono tabular-nums text-muted-foreground/80">
            (0)
          </span>
        </h4>
        <span className="h-px flex-1 bg-border/50" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    </section>
  );
}
