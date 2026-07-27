import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { cn } from "@/shared/lib/utils";

type CatalogEmptyMessageProps = {
  message: string;
  className?: string;
};

/** Empty / sem resultados em listagens do compêndio. */
export function CatalogEmptyMessage({
  message,
  className,
}: CatalogEmptyMessageProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 py-6 text-sm text-muted-foreground",
        className,
      )}
      role="status"
    >
      <MagnifyingGlassIcon className="size-5 shrink-0 opacity-55" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
