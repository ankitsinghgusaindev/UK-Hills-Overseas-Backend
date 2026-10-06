import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
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

    // 2. Read request body
    const body = await request.json();
    const { orderId } = body;

    // 3. Validate order ID
    if (
      typeof orderId !== "number" ||
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid order ID is required.",
        },
        { status: 400 },
      );
    }

    // 4. Check Razorpay credentials
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay credentials are missing.",
        },
        { status: 500 },
      );
    }

    // 5. Find order belonging to logged-in user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      select: {
        id: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        razorpayOrderId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 },
      );
    }

    // 6. Ensure this is a Razorpay order
    if (order.paymentMethod !== "RAZORPAY") {
      return NextResponse.json(
        {
          success: false,
          message: "This order is not configured for Razorpay payment.",
        },
        { status: 400 },
      );
    }

    // 7. Don't create another Razorpay order
    if (order.razorpayOrderId) {
      return NextResponse.json(
        {
          success: true,
          message: "Razorpay order already exists.",
          data: {
            id: order.razorpayOrderId,
            databaseOrderId: order.id,
            amount: order.totalAmount.toNumber(),
          },
        },
        { status: 200 },
      );
    }

    // 8. Ensure order is still pending
    if (order.paymentStatus !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "This order is no longer pending.",
        },
        { status: 400 },
      );
    }

    // 9. Create Razorpay client
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 10. Amount comes from database
    const amount = order.totalAmount.toNumber();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `UKH_${order.id}`,
    });

    // 11. Save Razorpay order ID
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Razorpay order created successfully.",
        data: {
          ...razorpayOrder,
          databaseOrderId: order.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Razorpay order.",
      },
      { status: 500 },
    );
  }
}