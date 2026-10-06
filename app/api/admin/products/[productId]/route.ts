import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/services/product.service";
import { updateProductSchema } from "@/validations/product.validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin();

    const { productId } = await params;
    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid product ID", 400);
    }

    const product = await getProductById(id);

    return successResponse(product, "Product fetched successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin();

    const { productId } = await params;
    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid product ID", 400);
    }

    const body = await request.json();

    const validationResult = validateRequest(
      updateProductSchema,
      body,
    );

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const product = await updateProduct(
      id,
      validationResult.data,
    );

    return successResponse(
      product,
      "Product updated successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin();

    const { productId } = await params;
    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid product ID", 400);
    }

    const product = await deleteProduct(id);

    return successResponse(
      product,
      "Product deleted successfully",
    );
  } catch (error) {
    return handleApiError(error);
  }
}