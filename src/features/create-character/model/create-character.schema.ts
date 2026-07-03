import { z } from "zod";

const SUBCLASS_UNLOCK_LEVEL = 3;

export const createCharacterSchema = z
  .object({
    name: z.string().min(1, "Informe o nome").max(100),
    level: z.number().int().min(1, "Mínimo nível 1").max(20, "Máximo nível 20"),
    classSlug: z.string().min(1, "Escolha uma classe"),
    speciesSlug: z.string().min(1, "Escolha uma espécie"),
    backgroundSlug: z.string().min(1, "Escolha um antecedente"),
    subclassSlug: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.level >= SUBCLASS_UNLOCK_LEVEL && !data.subclassSlug?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: `Subclasse obrigatória a partir do nível ${SUBCLASS_UNLOCK_LEVEL}`,
        path: ["subclassSlug"],
      });
    }
  });

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

export const SUBCLASS_REQUIRED_FROM_LEVEL = SUBCLASS_UNLOCK_LEVEL;

export const LEVEL_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);
