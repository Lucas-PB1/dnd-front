import { z } from "zod";

const dndApiEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .refine((url) => !url.endsWith("/"), "Remova a barra final da URL"),
});

export type DndApiEnv = z.infer<typeof dndApiEnvSchema>;

export function isDndApiConfigured(): boolean {
  return dndApiEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }).success;
}

export function getDndApiEnv(): DndApiEnv {
  return dndApiEnvSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
}

export function getDndApiBaseUrl(): string {
  return getDndApiEnv().NEXT_PUBLIC_API_URL;
}
