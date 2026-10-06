import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/services/order.service";
import { updateOrderStatusSchema } from "@/validations/order.validation";
import { validateRequest } from "@/lib/validate";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    // Only ADMIN can update order status
    await requireAdmin();

    const { orderId } = await params;
    const id = Number(orderId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid order ID", 400);
    }

    const body = await request.json();

    const validationResult = validateRequest(updateOrderStatusSchema, body);

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const result = await updateOrderStatus(id, validationResult.data.status);

    return successResponse(result, "Order status updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
