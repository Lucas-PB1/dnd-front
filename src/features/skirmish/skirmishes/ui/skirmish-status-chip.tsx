import { cn } from "@/shared/lib/utils";
import {
  skirmishStatusLabel,
  type SkirmishStatus,
} from "@/features/skirmish/skirmishes/api/skirmishes.api";

export function SkirmishStatusChip({ status }: { status: SkirmishStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        status === "active"
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-border/80 bg-muted/30 text-muted-foreground",
      )}
    >
      {skirmishStatusLabel(status)}
    </span>
  );
}
