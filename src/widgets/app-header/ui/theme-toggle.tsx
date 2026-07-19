"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        isDark ? "Ativar tema claro (Taverna)" : "Ativar tema escuro (Masmorra)"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="relative size-4">
        <SunIcon
          className={cn(
            "absolute inset-0 size-4 transition-all duration-300 ease-out",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-50 opacity-0",
          )}
          aria-hidden
        />
        <MoonIcon
          className={cn(
            "absolute inset-0 size-4 transition-all duration-300 ease-out",
            !isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0",
          )}
          aria-hidden
        />
      </span>
    </Button>
  );
}
