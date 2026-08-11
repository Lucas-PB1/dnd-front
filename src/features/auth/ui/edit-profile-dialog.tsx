"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

import { updateUserProfile } from "@/features/auth/api/update-user-profile";
import {
  AVATAR_ACCEPT,
  userProfileSchema,
  type UserProfileFormValues,
} from "@/features/auth/model/profile.schema";
import {
  profileInitial,
  readUserProfile,
} from "@/features/auth/model/user-profile";
import { useAuth } from "@/features/auth/model";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { user } = useAuth();
  const profile = useMemo(() => readUserProfile(user), [user]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clearAvatar, setClearAvatar] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      displayName: profile.displayName,
      bio: profile.bio,
    },
  });

  const bioValue = watch("bio") ?? "";

  useEffect(() => {
    if (!open) return;
    reset({
      displayName: profile.displayName,
      bio: profile.bio,
    });
    setAvatarFile(null);
    setClearAvatar(false);
    setSubmitError(null);
  }, [open, profile.displayName, profile.bio, reset]);

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const shownAvatar =
    previewUrl ??
    (clearAvatar ? null : profile.avatarUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Nome, foto e uma bio curta — aparecem na campanha e no menu.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit(async (values) => {
            setSubmitError(null);
            try {
              await updateUserProfile({
                values,
                avatarFile,
                clearAvatar,
                currentAvatarUrl: profile.avatarUrl,
              });
              onOpenChange(false);
            } catch (error) {
              setSubmitError(
                error instanceof Error
                  ? error.message
                  : "Não foi possível salvar o perfil.",
              );
            }
          })}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-full border border-secondary/40 bg-secondary/15",
              )}
            >
              {shownAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar URL externa / blob
                <img
                  src={shownAvatar}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center font-heading text-lg font-semibold text-secondary">
                  {profileInitial(profile, user?.email)}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-secondary hover:underline">
                <PhotoIcon className="size-4" aria-hidden />
                Trocar foto
                <input
                  type="file"
                  accept={AVATAR_ACCEPT}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setAvatarFile(file);
                    setClearAvatar(false);
                    event.target.value = "";
                  }}
                />
              </label>
              {(shownAvatar || avatarFile) && !clearAvatar ? (
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setAvatarFile(null);
                    setClearAvatar(true);
                  }}
                >
                  <TrashIcon className="size-3.5" aria-hidden />
                  Remover foto
                </button>
              ) : null}
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WebP · até 2 MB
              </p>
            </div>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-display-name">
                Nome de usuário
              </FieldLabel>
              <Input
                id="profile-display-name"
                autoComplete="nickname"
                maxLength={40}
                aria-invalid={!!errors.displayName}
                {...register("displayName")}
              />
              <FieldError errors={[errors.displayName]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-bio">Bio curta</FieldLabel>
              <textarea
                id="profile-bio"
                rows={3}
                maxLength={160}
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-invalid={!!errors.bio}
                {...register("bio")}
              />
              <div className="flex items-start justify-between gap-2">
                <FieldError errors={[errors.bio]} />
                <p className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {bioValue.length}/160
                </p>
              </div>
            </Field>
          </FieldGroup>

          {user?.email ? (
            <p className="text-xs text-muted-foreground">
              E-mail da conta: {user.email}
            </p>
          ) : null}

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
