import { z } from "zod";

import { catalogFetch } from "@/shared/api/dnd-api/api-client";
import { isDndApiConfigured } from "@/shared/api/dnd-api/env";

const nestHealthSchema = z.object({
  status: z.string(),
  db: z.string().optional(),
});

export type NestHealthResponse = z.infer<typeof nestHealthSchema>;

export async function fetchNestHealth(): Promise<NestHealthResponse | null> {
  if (!isDndApiConfigured()) {
    return null;
  }

  const data = await catalogFetch<unknown>("/health", {
    cache: "no-store",
  });

  return nestHealthSchema.parse(data);
}
