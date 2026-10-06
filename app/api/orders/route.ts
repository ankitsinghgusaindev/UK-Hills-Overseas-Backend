// app/api/orders/route.ts

import { createOrderSchema } from "@/validations/order.validation";
import { validateRequest } from "@/lib/validate";
import { createOrder, getOrders } from "@/services/order.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/auth";

// CREATE ORDER
export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const user = await getAuthenticatedUser();

    if (!user) {
      return errorResponse("Not authenticated", 401);
    }
    const body = await request.json();

    const validation = validateRequest(createOrderSchema, body);

    if (!validation.success) {
      return errorResponse("Invalid order data", 400, validation.errors);
    }

    const order = await createOrder(validation.data, user.id);

    return successResponse(order, "Order created successfully", 201);
  } catch (error) {
    console.error("Order creation failed:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Failed to create order",
      500,
    );
  }
}

// GET ALL ORDERS
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return errorResponse("Not authenticated", 401);
    }

    const orders = await getOrders(user.id);

    return successResponse(orders, "Orders fetched successfully", 200);
  } catch (error) {
    console.error("Fetching orders failed:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch orders",
      500,
    );
  }
}
