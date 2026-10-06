import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate";
import { createProductVariant } from "@/services/variant.service";
import { createVariantSchema } from "@/validations/variant.validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    // Only ADMIN can create variants
    await requireAdmin();

    const { productId } = await params;
    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid product ID", 400);
    }

    const body = await request.json();

    const validationResult = validateRequest(createVariantSchema, body);

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const variant = await createProductVariant(id, {
      weight: validationResult.data.weight,
      price: new Prisma.Decimal(validationResult.data.price),
      sku: validationResult.data.sku,
      stock: validationResult.data.stock,
    });

    return successResponse(
      variant,
      "Product variant created successfully",
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
