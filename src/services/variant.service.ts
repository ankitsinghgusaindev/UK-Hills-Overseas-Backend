import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/error";

export async function updateVariantPrice(
  variantId: number,
  newPrice: Prisma.Decimal,
) {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: {
        id: variantId,
      },
      select: {
        id: true,
        productId: true,
      },
    });

    if (!variant) {
  throw new AppError("Variant not found", 404);
}
    await tx.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        price: newPrice,
      },
    });

    const variants = await tx.productVariant.findMany({
      where: {
        productId: variant.productId,
      },
      select: {
        price: true,
      },
    });

    if (variants.length === 0) {
  throw new AppError("Product has no variants", 409);
}

    const minPrice = variants.reduce((minimum, current) => {
      return current.price.lessThan(minimum) ? current.price : minimum;
    }, variants[0].price);

    await tx.product.update({
      where: {
        id: variant.productId,
      },
      data: {
        minPrice,
      },
    });


    return {
      variantId,
      productId: variant.productId,
      minPrice,
    };
  });
}

export async function createProductVariant(
  productId: number,
  data: {
    weight: string;
    price: Prisma.Decimal;
    sku: string;
    stock: number;
  },
) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const existingSku = await prisma.productVariant.findUnique({
    where: {
      sku: data.sku,
    },
  });

  if (existingSku) {
    throw new AppError("Variant SKU already exists", 409);
  }

  const variant = await prisma.$transaction(async (tx) => {
    const createdVariant = await tx.productVariant.create({
      data: {
        productId,
        weight: data.weight,
        price: data.price,
        sku: data.sku,
        stock: data.stock,
      },
    });

    const variants = await tx.productVariant.findMany({
      where: {
        productId,
      },
      select: {
        price: true,
      },
    });

    const minPrice = variants.reduce(
      (minimum, current) => {
        return current.price.lessThan(minimum)
          ? current.price
          : minimum;
      },
      variants[0].price,
    );

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        minPrice,
      },
    });

    return createdVariant;
  });

  return variant;
}

export async function updateProductVariant(
  variantId: number,
  data: {
    weight?: string;
    price?: Prisma.Decimal;
    sku?: string;
    stock?: number;
  },
) {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
  });

  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  if (data.sku && data.sku !== variant.sku) {
    const existingSku = await prisma.productVariant.findUnique({
      where: {
        sku: data.sku,
      },
    });

    if (existingSku) {
      throw new AppError("Variant SKU already exists", 409);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updatedVariant = await tx.productVariant.update({
      where: {
        id: variantId,
      },
      data,
    });

    // Recalculate Product.minPrice if price was changed
    if (data.price !== undefined) {
      const variants = await tx.productVariant.findMany({
        where: {
          productId: variant.productId,
        },
        select: {
          price: true,
        },
      });

      if (variants.length === 0) {
        throw new AppError(
          "Product has no variants",
          409,
        );
      }

      const minPrice = variants.reduce(
        (minimum, current) => {
          return current.price.lessThan(minimum)
            ? current.price
            : minimum;
        },
        variants[0].price,
      );

      await tx.product.update({
        where: {
          id: variant.productId,
        },
        data: {
          minPrice,
        },
      });
    }

    return updatedVariant;
  });
}

export async function deleteProductVariant(
  variantId: number,
) {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    include: {
      orderItems: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  if (variant.orderItems.length > 0) {
    throw new AppError(
      "Cannot delete variant because it has order history",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.productVariant.delete({
      where: {
        id: variantId,
      },
    });

    const remainingVariants =
      await tx.productVariant.findMany({
        where: {
          productId: variant.productId,
        },
        select: {
          price: true,
        },
      });

    let minPrice: Prisma.Decimal | null = null;

    if (remainingVariants.length > 0) {
      minPrice = remainingVariants.reduce(
        (minimum, current) => {
          return current.price.lessThan(minimum)
            ? current.price
            : minimum;
        },
        remainingVariants[0].price,
      );
    }

    await tx.product.update({
      where: {
        id: variant.productId,
      },
      data: {
        minPrice,
      },
    });

    return {
      deletedVariantId: variantId,
      productId: variant.productId,
      minPrice,
    };
  });
}

export async function updateVariantStock(
  variantId: number,
  stock: number,
) {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
  });

  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  return prisma.productVariant.update({
    where: {
      id: variantId,
    },
    data: {
      stock,
    },
  });
}