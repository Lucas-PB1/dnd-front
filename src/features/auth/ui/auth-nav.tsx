"use client";

import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  MapIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";

import { EditProfileDialog } from "@/features/auth/ui/edit-profile-dialog";
import { useAuth } from "@/features/auth/model";
import {
  profileInitial,
  profileLabel,
  readUserProfile,
} from "@/features/auth/model/user-profile";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

export function AuthNav() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuId = useId();
  const profile = useMemo(() => readUserProfile(user), [user]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!isConfigured) {
    return (
      <span className="text-xs text-muted-foreground">Login indisponível</span>
    );
  }

  if (isLoading) {
    return (
      <span
        className="inline-flex size-8 animate-pulse rounded-full border border-border/60 bg-muted/40"
        aria-hidden
      />
    );
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

  const email = user.email ?? "";
  const label = profileLabel(profile, email);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 px-1.5 sm:px-2"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label="Menu da conta"
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-secondary/40 bg-secondary/15 font-heading text-xs font-semibold text-secondary"
            aria-hidden
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              profileInitial(profile, email)
            )}
          </span>
          <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
            {label}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </Button>

        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Fechar menu da conta"
              onClick={() => setOpen(false)}
            />
            <div
              id={menuId}
              role="menu"
              aria-label="Conta"
              className="absolute top-full right-0 z-50 mt-1 w-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
            >
              <div className="border-b border-border/70 px-3 py-2.5">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Conta
                </p>
                <p className="mt-0.5 truncate text-sm font-medium" title={label}>
                  {label}
                </p>
                {email && email !== label ? (
                  <p className="truncate text-xs text-muted-foreground" title={email}>
                    {email}
                  </p>
                ) : null}
                {profile.bio ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {profile.bio}
                  </p>
                ) : null}
              </div>

              <div className="p-1">
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    setProfileOpen(true);
                  }}
                >
                  <PencilSquareIcon className="size-4 opacity-80" aria-hidden />
                  Editar perfil
                </button>
                <Link
                  href="/characters"
                  role="menuitem"
                  className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <UserGroupIcon className="size-4 opacity-80" aria-hidden />
                  Minhas fichas
                </Link>
                <Link
                  href="/campaigns"
                  role="menuitem"
                  className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <MapIcon className="size-4 opacity-80" aria-hidden />
                  Campanhas
                </Link>
              </div>

              <div className="border-t border-border/70 p-1">
                <button
                  type="button"
                  role="menuitem"
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                  onClick={() => {
                    void handleSignOut();
                  }}
                >
                  <ArrowRightStartOnRectangleIcon
                    className="size-4"
                    aria-hidden
                  />
                  {isSigningOut ? "Saindo…" : "Sair"}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <EditProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
