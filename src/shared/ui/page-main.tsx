import { cn } from "@/shared/lib/utils";

/** Larguras de layout da app — ver docs/UX-UI-PLAN.md */
export const contentWidthClass = {
  /** Listagens, hub, wizard, páginas gerais */
  page: "mx-auto w-full max-w-6xl",
  /** Ficha / layouts densos */
  wide: "mx-auto w-full max-w-7xl",
  /** Hero da home (composição centrada) */
  hero: "mx-auto w-full max-w-3xl",
  /** Formulários de auth */
  auth: "mx-auto w-full max-w-sm",
} as const;

export type ContentWidth = keyof typeof contentWidthClass;

type PageMainProps = {
  children: React.ReactNode;
  width?: ContentWidth;
  className?: string;
};

export function PageMain({
  children,
  width = "page",
  className,
}: PageMainProps) {
  return (
    <main
      className={cn(
        contentWidthClass[width],
        "flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10",
        className,
      )}
    >
      {children}
    </main>
  );
}
