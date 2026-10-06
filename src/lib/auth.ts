import { cookies } from "next/headers";
import { getCurrentUser } from "@/services/authService";
import { AppError } from "./error";

export async function getAuthenticatedUser(context: "admin" | "customer") {
  const cookieStore = await cookies();

  const cookieName =
    context === "admin" ? "adminSessionId" : "customerSessionId";

  const sessionId = cookieStore.get(cookieName)?.value;

  if (!sessionId) {
    return null;
  }

  const user = await getCurrentUser(sessionId);

  if (!user) {
    return null;
  }

  const expectedRole = context === "admin" ? "ADMIN" : "CUSTOMER";

  if (user.role !== expectedRole) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser("admin");

  if (!user) {
    throw new AppError("Not authenticated", 401);
  }

  return user;
}

export async function requireCustomer() {
  const user = await getAuthenticatedUser("customer");

  if (!user) {
    throw new AppError("Not authenticated", 401);
  }

  return user;
}