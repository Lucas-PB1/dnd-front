import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { motion } from "@/shared/lib/motion";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-12 text-center",
        motion.enter,
        className,
      )}
    >
      {icon ? (
        <div className="motion-fade text-muted-foreground">{icon}</div>
      ) : null}
      <div className="space-y-2">
        <p className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
