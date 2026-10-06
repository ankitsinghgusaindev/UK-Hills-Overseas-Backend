import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Product slug must be at least 2 characters"),

  description: z
    .string()
    .trim()
    .optional(),

  sku: z
    .string()
    .trim()
    .min(2, "Product SKU is required"),

  categoryId: z
    .coerce
    .number()
    .int()
    .positive("Category ID must be valid"),

  image: z
    .string()
    .trim()
    .optional(),

  benefits: z
    .array(z.string().trim())
    .default([]),

  ingredients: z
    .string()
    .trim()
    .optional(),

  storage: z
    .string()
    .trim()
    .optional(),

  nutrition: z
    .record(z.string(), z.any())
    .optional(),

  shelfLife: z
    .string()
    .trim()
    .optional(),

  origin: z
    .string()
    .trim()
    .optional(),

  tags: z
    .array(z.string().trim())
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();