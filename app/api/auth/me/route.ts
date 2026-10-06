import { cookies } from "next/headers";
import { getCurrentUser } from "@/services/authService";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context");

    if (context !== "admin" && context !== "customer") {
      return errorResponse("Invalid authentication context", 400);
    }

    const cookieStore = await cookies();

    const cookieName =
      context === "admin" ? "adminSessionId" : "customerSessionId";

    const sessionId = cookieStore.get(cookieName)?.value;

    if (!sessionId) {
      return errorResponse("Not authenticated", 401);
    }

    const user = await getCurrentUser(sessionId);

    if (!user) {
      return errorResponse("Session expired or invalid", 401);
    }

    const expectedRole = context === "admin" ? "ADMIN" : "CUSTOMER";

    if (user.role !== expectedRole) {
      return errorResponse("Unauthorized", 403);
    }

    return successResponse(
      user,
      "Current user fetched successfully",
      200
    );
  } catch (error) {
    console.error("Fetching current user failed:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch current user",
      500
    );
  }
}