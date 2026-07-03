import { z } from "zod";

export const createCharacterSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(100),
  classSlug: z.string().min(1, "Escolha uma classe"),
  speciesSlug: z.string().min(1, "Escolha uma espécie"),
  backgroundSlug: z.string().min(1, "Escolha um antecedente"),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

export type CreateCharacterPayload = CreateCharacterInput;
