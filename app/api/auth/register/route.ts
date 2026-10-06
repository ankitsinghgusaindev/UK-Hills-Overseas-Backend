import { registerSchema } from "@/validations/auth.validation";
import { validateRequest } from "@/lib/validate";
import { registerUser } from "@/services/authService";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = validateRequest(registerSchema, body);

    if (!validation.success) {
      return errorResponse(
        "Invalid registration data",
        400,
        validation.errors
      );
    }

    const user = await registerUser(validation.data);

    return successResponse(
      user,
      "Registration successful",
      201
    );
  } catch (error) {
    console.error("Registration failed:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Registration failed",
      400
    );
  }
}