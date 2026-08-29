import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { cn } from "@/shared/lib/utils";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
