import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";

import {
  updateProductVariant,
  deleteProductVariant,
} from "@/services/variant.service";

import { updateVariantSchema } from "@/validations/variant.validation";

import { validateRequest } from "@/lib/validate";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";

// ==========================================
// PATCH - Update Variant
// ==========================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  try {
    // Only ADMIN can access this route
    await requireAdmin();

    const { variantId } = await params;
    const id = Number(variantId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid variant ID", 400);
    }

    const body = await request.json();

    const validationResult = validateRequest(updateVariantSchema, body);

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const data = validationResult.data;

    const result = await updateProductVariant(id, {
      ...(data.weight !== undefined && {
        weight: data.weight,
      }),

      ...(data.price !== undefined && {
        price: new Prisma.Decimal(data.price),
      }),

      ...(data.sku !== undefined && {
        sku: data.sku,
      }),

      ...(data.stock !== undefined && {
        stock: data.stock,
      }),
    });

    return successResponse(result, "Variant updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// ==========================================
// DELETE - Delete Variant
// ==========================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  try {
    // Only ADMIN can access this route
    await requireAdmin();

    const { variantId } = await params;
    const id = Number(variantId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid variant ID", 400);
    }

    const result = await deleteProductVariant(id);

    return successResponse(result, "Variant deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
