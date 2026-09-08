import { mapAuthError } from "@/features/auth/api/auth-errors";
import {
  AVATAR_MAX_BYTES,
} from "@/features/auth/model/profile.schema";
import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";

const AVATARS_BUCKET = "avatars";

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Retrato do PC no bucket `avatars` sob `{userId}/characters/{characterId}`. */
export async function uploadCharacterPortrait(
  userId: string,
  characterId: string,
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
  const path = `${userId}/characters/${characterId}.${ext}`;

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
        "Não foi possível enviar o retrato. Confira se o bucket avatars existe.",
    );
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const url = new URL(data.publicUrl);
  url.searchParams.set("v", String(Date.now()));
  return url.toString();
}
