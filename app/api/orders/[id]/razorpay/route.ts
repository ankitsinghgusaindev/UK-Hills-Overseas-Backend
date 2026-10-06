import { NextRequest, NextResponse } from "next/server";
import { attachRazorpayOrderId } from "@/services/order.service";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }
    const { id } = await context.params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const razorpayOrderId = body.razorpayOrderId;

    if (typeof razorpayOrderId !== "string" || !razorpayOrderId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order ID is required.",
        },
        { status: 400 },
      );
    }

    const order = await attachRazorpayOrderId(orderId, razorpayOrderId.trim(),user.id,);

    return NextResponse.json({
      success: true,
      message: "Razorpay order ID saved successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Saving Razorpay order ID failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to save Razorpay order ID.",
      },
      { status: 500 },
    );
  }
}
