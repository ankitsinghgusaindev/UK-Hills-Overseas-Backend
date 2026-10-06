import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 12;
  const MAX_LIMIT = 50;

  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const requestedPage = pageParam === null ? null : Number(pageParam);
  const requestedLimit = limitParam === null ? null : Number(limitParam);

  // Validate page
  if (
    requestedPage !== null &&
    (!Number.isInteger(requestedPage) || requestedPage < 1)
  ) {
    return Response.json(
      {
        success: false,
        message: "Page must be a positive integer",
      },
      {
        status: 400,
      },
    );
  }

  // Validate limit
  if (
    requestedLimit !== null &&
    (!Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > MAX_LIMIT)
  ) {
    return Response.json(
      {
        success: false,
        message: `Limit must be an integer between 1 and ${MAX_LIMIT}`,
      },
      {
        status: 400,
      },
    );
  }

  const page = requestedPage ?? DEFAULT_PAGE;
  const limit = requestedLimit ?? DEFAULT_LIMIT;

  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";
  const sort = searchParams.get("sort") || "newest";

  const allowedSorts = [
    "newest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
  ] as const;

  if (!allowedSorts.includes(sort as (typeof allowedSorts)[number])) {
    return Response.json(
      {
        success: false,
        message: "Invalid sort option",
      },
      {
        status: 400,
      },
    );
  }

  const orderBy =
    sort === "price_asc"
      ? [{ minPrice: "asc" as const }, { id: "asc" as const }]
      : sort === "price_desc"
        ? [{ minPrice: "desc" as const }, { id: "desc" as const }]
        : sort === "name_asc"
          ? [{ name: "asc" as const }, { id: "asc" as const }]
          : sort === "name_desc"
            ? [{ name: "desc" as const }, { id: "desc" as const }]
            : [{ id: "desc" as const }];

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),

    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
  };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          minPrice: true,
          image: true,
          benefits: true,
          ingredients: true,
          storage: true,
          nutrition: true,
          shelfLife: true,
          origin: true,
          rating: true,
          reviews: true,
          tags: true,

          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          variants: {
            select: {
              id: true,
              weight: true,
              price: true,
              sku: true,
            },
          },
        },
      }),

      prisma.product.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse(products, "Products fetched successfully", 200, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}
