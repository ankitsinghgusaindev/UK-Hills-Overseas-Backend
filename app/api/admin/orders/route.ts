import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { getAllOrders } from "@/services/order.service";

export async function GET() {
  try {
    await requireAdmin();

    const orders = await getAllOrders();

    return successResponse(
      orders,
      "Orders fetched successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}