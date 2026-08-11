import { z } from "zod";

export const userProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Use pelo menos 2 caracteres")
    .max(40, "No máximo 40 caracteres"),
  bio: z.string().trim().max(160, "No máximo 160 caracteres").default(""),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";
