import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser("customer");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }
    
    const body = await request.json();

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      body;

    if (
      !Number.isInteger(Number(orderId)) ||
      Number(orderId) <= 0 ||
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string" ||
      !razorpayOrderId.trim() ||
      !razorpayPaymentId.trim() ||
      !razorpaySignature.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment verification details.",
        },
        { status: 400 },
      );
    }

    const databaseOrder = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
         userId: user.id,
      },
    });

    if (!databaseOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 },
      );
    }

    if (databaseOrder.paymentMethod !== "RAZORPAY") {
      return NextResponse.json(
        {
          success: false,
          message: "This order is not a Razorpay order.",
        },
        { status: 400 },
      );
    }

    // The Razorpay order ID must already be saved in our database.
    if (
      !databaseOrder.razorpayOrderId ||
      databaseOrder.razorpayOrderId !== razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order mismatch.",
        },
        { status: 400 },
      );
    }

    // Keep verification idempotent.
    // The Razorpay order must still match before we return
    // an already-paid order.
    if (databaseOrder.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Payment has already been verified.",
        data: databaseOrder,
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Payment configuration is missing.",
        },
        { status: 500 },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedSignature = Buffer.from(generatedSignature, "utf8");
    const receivedSignature = Buffer.from(razorpaySignature, "utf8");

    const isSignatureValid =
      expectedSignature.length === receivedSignature.length &&
      crypto.timingSafeEqual(expectedSignature, receivedSignature);

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Razorpay payment signature.",
        },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: databaseOrder.id,
      },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId,
        razorpaySignature,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            variant: {
              select: {
                id: true,
                weight: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify payment.",
      },
      { status: 500 },
    );
  }
}
