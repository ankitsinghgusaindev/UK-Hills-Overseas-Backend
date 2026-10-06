import { NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth.validation";
import { validateRequest } from "@/lib/validate";
import { loginUser, createSession } from "@/services/authService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateRequest(loginSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login data",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const user = await loginUser(validation.data);
    const session = await createSession(user.id);

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: { user },
      },
      { status: 200 }
    );

    const cookieName =
      user.role === "ADMIN" ? "adminSessionId" : "customerSessionId";

    response.cookies.set(cookieName, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      },
      { status: 401 }
    );
  }
}