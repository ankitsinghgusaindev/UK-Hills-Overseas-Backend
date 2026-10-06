import { apiClient } from "@/lib/api-client";
import type { Product } from "@/types/product";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: "newest" | "name_asc" | "name_desc";
}

export async function getProducts(
  params: GetProductsParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const queryString = searchParams.toString();

  const url = queryString
    ? `/api/products?${queryString}`
    : "/api/products";

  return apiClient.get<Product[]>(url);
}