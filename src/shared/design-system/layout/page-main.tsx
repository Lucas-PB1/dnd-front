import { motion } from "@/shared/design-system/tokens/motion";
import { cn } from "@/shared/lib/utils";
import {
  contentWidthClass,
  type ContentWidth,
} from "@/shared/design-system/tokens/layout";

export { contentWidthClass, type ContentWidth };

type PageMainProps = {
  children: React.ReactNode;
  width?: ContentWidth;
  className?: string;
  /** Desliga a entrada animada (ex.: layouts densos da ficha). */
  muteMotion?: boolean;
};

export function PageMain({
  children,
  width = "page",
  className,
  muteMotion = false,
}: PageMainProps) {
  return (
    <main
      className={cn(
        contentWidthClass[width],
        "flex flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10",
        !muteMotion && motion.page,
        className,
      )}
    >
      {children}
    </main>
  );
}
