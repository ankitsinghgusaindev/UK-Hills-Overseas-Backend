import { cookies } from "next/headers";

import { logoutUser } from "@/services/authService";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: Request) {
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

    if (sessionId) {
      await logoutUser(sessionId);
    }

    cookieStore.delete(cookieName);

    return successResponse(null, "Logout successful", 200);
  } catch (error) {
    console.error("Logout failed:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Logout failed",
      500
    );
  }
}