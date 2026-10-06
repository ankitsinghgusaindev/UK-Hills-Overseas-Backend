import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate";
import { createProduct, getProducts } from "@/services/product.service";
import { createProductSchema } from "@/validations/product.validation";

export async function GET() {
  try {
    await requireAdmin();

    const products = await getProducts();

    return successResponse(products, "Products fetched successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = validateRequest(createProductSchema, body);

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const product = await createProduct(validationResult.data);

    return successResponse(product, "Product created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
