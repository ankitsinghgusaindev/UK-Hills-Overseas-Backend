import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getOrderById } from "@/services/order.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdmin();

    const { orderId } = await params;

    const id = Number(orderId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid order ID", 400);
    }

    const order = await getOrderById(id);

    return successResponse(
      order,
      "Order fetched successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}