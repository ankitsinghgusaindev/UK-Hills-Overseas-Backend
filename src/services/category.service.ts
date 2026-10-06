import prisma from "@/lib/prisma";
import { AppError } from "@/lib/error";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function createCategory(name: string, slug: string) {
  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (existingCategory) {
    throw new AppError("Category slug already exists", 409);
  }

  return prisma.category.create({
    data: {
      name,
      slug,
    },
  });
}

export async function deleteCategory(categoryId: number) {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category.products.length > 0) {
    throw new AppError("Cannot delete category because it has products", 409);
  }

  return prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
}
