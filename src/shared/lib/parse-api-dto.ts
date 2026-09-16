import { z, type ZodType } from "zod";

export class ApiDtoError extends Error {
  constructor(message: string, readonly issues?: unknown) {
    super(message);
    this.name = "ApiDtoError";
  }
}

export function parseApiDto<T>(
  schema: ZodType<T>,
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  throw new ApiDtoError(
    `Resposta inválida (${label}). Recarregue a ficha; se persistir, o contrato da API divergiu.`,
    result.error.issues,
  );
}
