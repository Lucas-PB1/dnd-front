import type { User } from "@supabase/supabase-js";

import { mapAuthError } from "@/features/auth/api/auth-errors";
import {
  AVATAR_MAX_BYTES,
  type UserProfileFormValues,
} from "@/features/auth/model/profile.schema";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";

const AVATARS_BUCKET = "avatars";

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie uma imagem (JPG, PNG ou WebP).");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("A foto deve ter no máximo 2 MB.");
  }

  const supabase = createSupabaseBrowserClient();
  const ext = extensionForMime(file.type);
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(
      mapAuthError(uploadError.message) ||
        "Não foi possível enviar a foto. Confira se o bucket avatars existe.",
    );
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const url = new URL(data.publicUrl);
  url.searchParams.set("v", String(Date.now()));
  return url.toString();
}

export async function updateUserProfile(input: {
  values: UserProfileFormValues;
  avatarFile?: File | null;
  clearAvatar?: boolean;
  currentAvatarUrl?: string | null;
}): Promise<User> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      userError ? mapAuthError(userError.message) : "Sessão expirada",
    );
  }

  let avatarUrl = input.clearAvatar
    ? null
    : (input.currentAvatarUrl ?? null);

  if (input.avatarFile) {
    avatarUrl = await uploadUserAvatar(user.id, input.avatarFile);
  }

  const displayName = input.values.displayName.trim();
  const bio = input.values.bio.trim();

  const { data, error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      full_name: displayName,
      bio,
      avatar_url: avatarUrl,
    },
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }
  if (!data.user) {
    throw new Error("Não foi possível atualizar o perfil.");
  }

  return data.user;
}
