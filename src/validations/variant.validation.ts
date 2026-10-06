import { z } from "zod";

export const updateVariantPriceSchema = z.object({
  price: z.coerce
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Price must be a valid amount with up to 2 decimals",
    })
    .refine((value) => Number(value) > 0, {
      message: "Price must be greater than zero",
    }),
});

export const createVariantSchema = z.object({
  weight: z.string().trim().min(1, "Weight is required"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  sku: z.string().trim().min(2, "Variant SKU is required"),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative"),
});

export const updateVariantSchema = z.object({
  weight: z.string().trim().min(1).optional(),

  price: z.coerce
    .number()
    .positive()
    .optional(),

  sku: z.string().trim().min(2).optional(),

  stock: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),
});

export const updateInventorySchema = z.object({
  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative"),
});