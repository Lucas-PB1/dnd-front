import { cn } from "@/shared/lib/utils";

/** Estilos para `<select>` nativo — contraste ok em light/dark (Windows/Chrome). */
export const nativeSelectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-card dark:text-foreground",
  "[&_option]:bg-background [&_option]:text-foreground",
  "dark:[&_option]:bg-card dark:[&_option]:text-foreground",
);
