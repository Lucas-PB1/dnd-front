import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  displayName: string;
  bio: string;
  avatarUrl: string | null;
};

function metaString(
  meta: User["user_metadata"] | undefined,
  key: string,
): string {
  const value = meta?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Lê nome / bio / foto do `user_metadata` do Auth. */
export function readUserProfile(user: User | null | undefined): UserProfile {
  if (!user) {
    return { displayName: "", bio: "", avatarUrl: null };
  }

  const meta = user.user_metadata;
  const displayName =
    metaString(meta, "display_name") ||
    metaString(meta, "full_name") ||
    metaString(meta, "name") ||
    "";

  const avatarRaw =
    metaString(meta, "avatar_url") || metaString(meta, "picture");
  const bio = metaString(meta, "bio");

  return {
    displayName,
    bio,
    avatarUrl: avatarRaw || null,
  };
}

export function profileInitial(
  profile: UserProfile,
  email: string | undefined,
): string {
  const fromName = profile.displayName.trim();
  if (fromName) return fromName.charAt(0).toUpperCase();
  const fromEmail = email?.trim();
  if (fromEmail) return fromEmail.charAt(0).toUpperCase();
  return "?";
}

export function profileLabel(
  profile: UserProfile,
  email: string | undefined,
): string {
  if (profile.displayName.trim()) return profile.displayName.trim();
  if (email?.trim()) return email.trim();
  return "Conta";
}
