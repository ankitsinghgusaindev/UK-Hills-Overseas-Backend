import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { errorResponse, successResponse } from "@/lib/api-response";
import { deleteCategory } from "@/services/category.service";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ categoryId: string }>;
  },
) {
  try {
    await requireAdmin();

    const { categoryId } = await params;

    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
      return errorResponse("Invalid category ID", 400);
    }

    const category = await deleteCategory(id);

    return successResponse(category, "Category deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
