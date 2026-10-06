import { z } from "zod";

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown,
) {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.flatten(),
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}