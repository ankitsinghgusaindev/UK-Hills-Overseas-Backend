import prisma from "@/lib/prisma";
import { AppError } from "@/lib/error";

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      category: true,
      variants: true,
    },
  });
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: number;
  image?: string;
  benefits: string[];
  ingredients?: string;
  storage?: string;
  nutrition?: Record<string, any>;
  shelfLife?: string;
  origin?: string;
  tags: string[];
}) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const existingSlug = await prisma.product.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSlug) {
    throw new AppError("Product slug already exists", 409);
  }

  const existingSku = await prisma.product.findUnique({
    where: {
      sku: data.sku,
    },
  });

  if (existingSku) {
    throw new AppError("Product SKU already exists", 409);
  }

  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      sku: data.sku,
      categoryId: data.categoryId,
      image: data.image,
      benefits: data.benefits,
      ingredients: data.ingredients,
      storage: data.storage,
      nutrition: data.nutrition,
      shelfLife: data.shelfLife,
      origin: data.origin,
      tags: data.tags,
    },
    include: {
      category: true,
      variants: true,
    },
  });
}

export async function getProductById(productId: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
}

export async function updateProduct(
  productId: number,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    sku?: string;
    categoryId?: number;
    image?: string;
    benefits?: string[];
    ingredients?: string;
    storage?: string;
    nutrition?: Record<string, any>;
    shelfLife?: string;
    origin?: string;
    tags?: string[];
  },
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if (data.slug && data.slug !== product.slug) {
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new AppError("Product slug already exists", 409);
    }
  }

  if (data.sku && data.sku !== product.sku) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new AppError("Product SKU already exists", 409);
    }
  }

  return prisma.product.update({
    where: { id: productId },
    data,
    include: {
      category: true,
      variants: true,
    },
  });
}

export async function deleteProduct(productId: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      orderItems: {
        select: {
          id: true,
        },
      },
      variants: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (product.orderItems.length > 0) {
    throw new AppError(
      "Cannot delete product because it has order history",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.productVariant.deleteMany({
      where: {
        productId,
      },
    });

    return tx.product.delete({
      where: {
        id: productId,
      },
    });
  });
}