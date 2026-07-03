import Link from "next/link";

import { AuthNav } from "@/features/auth/ui/auth-nav";
import { ThemeToggle } from "@/widgets/app-header/ui/theme-toggle";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="font-semibold tracking-tight hover:underline">
        dnd-front
      </Link>
      <div className="flex items-center gap-2">
        <AuthNav />
        <ThemeToggle />
      </div>
    </header>
  );
}
