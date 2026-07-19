"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/features/auth/model/use-auth";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

export function AuthNav() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isConfigured) {
    return <span className="text-xs text-muted-foreground">Auth off</span>;
  }

  if (isLoading) {
    return <span className="text-sm text-muted-foreground">…</span>;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Entrar
        </Link>
        <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <span className="hidden max-w-40 truncate text-sm text-muted-foreground lg:inline">
        {user.email}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isSigningOut}
        onClick={async () => {
          setIsSigningOut(true);
          try {
            await signOut();
            router.push("/");
            router.refresh();
          } finally {
            setIsSigningOut(false);
          }
        }}
      >
        {isSigningOut ? "Saindo…" : "Sair"}
      </Button>
    </div>
  );
}
