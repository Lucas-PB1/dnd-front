import { ZodError, type ZodType } from "zod";

export function parseBody<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function validationErrorResponse(error: ZodError) {
  return Response.json(
    {
      message: "Dados inválidos",
      errors: error.flatten(),
    },
    { status: 400 },
  );
}
