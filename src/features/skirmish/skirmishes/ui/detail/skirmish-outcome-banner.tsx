"use client";

import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { SealMark } from "@/shared/ui/brand-marks";
import { buttonVariants } from "@/shared/ui/button";

type SkirmishOutcomeBannerProps = {
  title: string;
  subtitle: string;
  tone: "victory" | "defeat" | "neutral";
};

export function SkirmishOutcomeBanner({
  title,
  subtitle,
  tone,
}: SkirmishOutcomeBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-border/80 bg-card/55 p-4 sm:flex-row sm:items-center sm:justify-between",
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <SealMark className="size-10 shrink-0" />
        <div className="space-y-0.5">
          <p
            className={cn(
              "font-heading text-xl font-semibold",
              tone === "victory" && "text-accent",
              tone === "defeat" && "text-destructive",
              tone === "neutral" && "text-muted-foreground",
            )}
          >
            {title}
          </p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <Link
        href="/skirmishes"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Voltar aos skirmishes
      </Link>
    </div>
  );
}
