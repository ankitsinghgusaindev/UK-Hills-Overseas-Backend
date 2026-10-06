import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import {
  errorResponse,
  successResponse,
} from "@/lib/api-response";
import { validateRequest } from "@/lib/validate";
import { updateVariantStock } from "@/services/variant.service";
import { updateInventorySchema } from "@/validations/variant.validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  try {
    await requireAdmin();

    const { variantId } = await params;
    const id = Number(variantId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid variant ID", 400);
    }

    const body = await request.json();

    const validationResult = validateRequest(
      updateInventorySchema,
      body,
    );

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const result = await updateVariantStock(
      id,
      validationResult.data.stock,
    );

    return successResponse(
      result,
      "Inventory updated successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}