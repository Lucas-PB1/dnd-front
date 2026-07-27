import { cn } from "@/shared/lib/utils";

type MarkProps = {
  className?: string;
  title?: string;
};

/** Selo de cera — monograma da Taverna. */
export function SealMark({ className, title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-secondary", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <circle
        cx="32"
        cy="32"
        r="23"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2.5 3.5"
        opacity="0.7"
      />
      <path
        d="M24 42V24h6.2c4.4 0 7.2 2.4 7.2 6.1 0 2.6-1.4 4.5-3.7 5.4L39.8 42h-5.1l-5.2-6.2H28.6V42H24Zm4.6-10.4h1.5c2.1 0 3.3-1.1 3.3-2.8s-1.2-2.7-3.3-2.7h-1.5v5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Traço ornamental sob o brand / títulos. */
export function InkFlourish({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 180 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-secondary/70", className)}
      aria-hidden
    >
      <path
        d="M4 8c28-6 52 6 86 0s54-6 86 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="90" cy="8" r="2.2" fill="currentColor" />
    </svg>
  );
}

/** Canto de margem de grimório (decoração de canto). */
export function MarginCorner({
  className,
  mirror,
}: MarkProps & { mirror?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "text-accent/40",
        mirror && "-scale-x-100",
        className,
      )}
      aria-hidden
    >
      <path
        d="M8 40V12c0-2.2 1.8-4 4-4h28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 16h8M12 20h5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** Pergaminho vazio — empty state de fichas. */
export function EmptyScrollMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground", className)}
      aria-hidden
    >
      <path
        d="M28 18h40c3.3 0 6 2.7 6 6v52c0 2.2-1.8 4-4 4H26c-2.2 0-4-1.8-4-4V24c0-3.3 2.7-6 6-6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M34 34h28M34 44h28M34 54h18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="68" cy="66" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M68 62.5v7M64.5 66h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mapa / mesa — empty state de campanhas. */
export function EmptyMapMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground", className)}
      aria-hidden
    >
      <path
        d="M18 30l20-8 20 8 20-8v48l-20 8-20-8-20 8V30Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M38 22v48M58 30v48"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <circle cx="48" cy="48" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M48 38v4M48 54v4M38 48h4M54 48h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
