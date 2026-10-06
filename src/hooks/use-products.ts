"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getProducts,
  type GetProductsParams,
} from "@/client/product-api";

import type { Product } from "@/types/product";
import { ClientApiError } from "@/lib/client-api-error";

export interface ProductsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useProducts(params: GetProductsParams = {}) {
  const {
    page,
    limit,
    search,
    category,
    sort,
  } = params;

  const stableParams = useMemo(
    () => ({
      page,
      limit,
      search,
      category,
      sort,
    }),
    [page, limit, search, category, sort],
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts(stableParams);

      setProducts(response.data);

      if (response.meta) {
        setPagination(response.meta as unknown as ProductsMeta);
      } else {
        setPagination(null);
      }
    } catch (error) {
      if (error instanceof ClientApiError) {
        setError(error.message);
      } else {
        setError("Something went wrong while fetching products");
      }
    } finally {
      setLoading(false);
    }
  }, [stableParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    refetch: loadProducts,
  };
}