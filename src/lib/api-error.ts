import { AppError } from "./error";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";
import { errorResponse } from "./api-response";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    return errorResponse(
      "Invalid request body",
      400,
      error.flatten(),
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse(
      "Requested record was not found",
      404,
    );
  }

  console.error("Unhandled API error:", error);

  return errorResponse("Internal server error", 500);
}