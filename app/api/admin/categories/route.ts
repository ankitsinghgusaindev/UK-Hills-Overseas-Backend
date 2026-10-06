import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";
import { validateRequest } from "@/lib/validate";
import { createCategory, getCategories } from "@/services/category.service";
import { createCategorySchema } from "@/validations/category.validation";

export async function GET() {
  try {
    await requireAdmin();

    const categories = await getCategories();

    return successResponse(categories, "Categories fetched successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = validateRequest(createCategorySchema, body);

    if (!validationResult.success) {
      return errorResponse(
        "Invalid request body",
        400,
        validationResult.errors,
      );
    }

    const category = await createCategory(
      validationResult.data.name,
      validationResult.data.slug,
    );

    return successResponse(category, "Category created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
