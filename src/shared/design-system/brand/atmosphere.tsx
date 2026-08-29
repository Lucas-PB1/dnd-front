import { cn } from "@/shared/lib/utils";

type AtmosphereProps = {
  className?: string;
  /** Intensidade da grade de caderno (0–1 visual via opacity classes). */
  lines?: boolean;
};

/**
 * Camada decorativa — grain + (opcional) linhas de caderno.
 * Sempre `aria-hidden`; não captura pointer.
 */
export function Atmosphere({ className, lines = true }: AtmosphereProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--muted)_70%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklch,var(--accent)_10%,transparent),transparent_45%)]" />
      {lines ? (
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.045] [background-image:repeating-linear-gradient(0deg,var(--foreground)_0_1px,transparent_1px_28px)]" />
      ) : null}
      <div className="atmosphere-grain absolute inset-0 opacity-[0.4] mix-blend-multiply dark:opacity-[0.28] dark:mix-blend-soft-light" />
    </div>
  );
}
