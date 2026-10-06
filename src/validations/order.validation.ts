
import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),

    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),

    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(300, "Address is too long"),

    city: z
      .string()
      .trim()
      .min(2, "City must be at least 2 characters")
      .max(100, "City is too long"),

    state: z
      .string()
      .trim()
      .min(2, "State must be at least 2 characters")
      .max(100, "State is too long"),

    postalCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Postal code must be 6 digits"),
  }),

  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, "Order must contain at least one item")
    .max(50, "Too many items in order"),

  // Coupon entered by the customer.
  // The backend will decide whether it is valid
  // and how much discount it gives.
  coupon: z
    .string()
    .trim()
    .max(30, "Coupon code is too long")
    .default(""),

  orderSource: z
    .enum(["WEBSITE", "WHATSAPP"])
    .default("WEBSITE"),

  paymentMethod: z
    .enum(["COD", "RAZORPAY", "MANUAL"])
    .default("COD"),

  paymentStatus: z
    .enum(["PENDING", "PAID", "FAILED", "CANCELLED", "NOT_REQUIRED"])
    .default("PENDING"),

  razorpayOrderId: z
    .string()
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});