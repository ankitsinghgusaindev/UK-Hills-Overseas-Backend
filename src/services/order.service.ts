// src/services/order.service.ts

import prisma from "@/lib/prisma";
import { Prisma, OrderStatus } from "@/generated/prisma/client";
import type { CreateOrderInput } from "@/validations/order.validation";
import { AppError } from "@/lib/error";

const COUPON_RATES: Record<string, Prisma.Decimal> = {
  WELCOME10: new Prisma.Decimal("0.10"),
  UKHILLS20: new Prisma.Decimal("0.20"),
};

const GST_RATE = new Prisma.Decimal("0.18");
const FREE_SHIPPING_THRESHOLD = new Prisma.Decimal("1000");
const STANDARD_SHIPPING = new Prisma.Decimal("80");

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function createOrder(input: CreateOrderInput, userId: number) {
  return prisma.$transaction(async (tx) => {
    // --------------------------------------------------
    // 1. Calculate subtotal using DATABASE prices
    // --------------------------------------------------

    let subtotal = new Prisma.Decimal(0);

    const orderItems = [];

    for (const item of input.items) {
      // Fetch the variant from the database.
      const variant = await tx.productVariant.findUnique({
        where: {
          id: item.variantId,
        },

        select: {
          id: true,
          productId: true,
          price: true,
        },
      });

      // Ensure that the variant exists.
      if (!variant) {
        throw new Error(`Product variant ${item.variantId} was not found`);
      }

      // Ensure that the product ID matches the variant's product.
      if (variant.productId !== item.productId) {
        throw new Error(
          `Variant ${item.variantId} does not belong to product ${item.productId}`,
        );
      }

      // Calculate line total using the DATABASE price.
      const lineTotal = variant.price.mul(item.quantity);

      subtotal = subtotal.add(lineTotal);

      orderItems.push({
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        price: variant.price,
      });
    }

    // --------------------------------------------------
    // 2. Calculate coupon discount
    // --------------------------------------------------

    const couponCode = input.coupon.trim().toUpperCase();

    const couponRate = COUPON_RATES[couponCode] ?? new Prisma.Decimal(0);

    const discount = subtotal.mul(couponRate);

    // --------------------------------------------------
    // 3. Calculate subtotal after discount
    // --------------------------------------------------

    const discountedSubtotal = subtotal.sub(discount);

    // --------------------------------------------------
    // 4. Calculate shipping
    // --------------------------------------------------

    const shipping = subtotal.greaterThan(FREE_SHIPPING_THRESHOLD)
      ? new Prisma.Decimal(0)
      : STANDARD_SHIPPING;

    // --------------------------------------------------
    // 5. Calculate GST
    // --------------------------------------------------

    const gst = discountedSubtotal.mul(GST_RATE);

    // --------------------------------------------------
    // 6. Calculate FINAL order amount
    // --------------------------------------------------

    const totalAmount = discountedSubtotal.add(gst).add(shipping);

    // --------------------------------------------------
    // 7. Create the order
    // --------------------------------------------------

    const order = await tx.order.create({
      data: {
        userId,
        customerName: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        address: input.customer.address,
        city: input.customer.city,
        state: input.customer.state,
        postalCode: input.customer.postalCode,

        // Final amount calculated securely on the backend.
        totalAmount,

        // Order and payment details
        orderSource: input.orderSource,
        paymentMethod: input.paymentMethod,
        paymentStatus: "PENDING",

        // Used for Razorpay orders
        // razorpayOrderId: input.razorpayOrderId,

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },

            variant: {
              select: {
                id: true,
                weight: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return order;
  });
}

// --------------------------------------------------
// Get orders from database
// --------------------------------------------------

export async function getOrders(userId: number) {
  return prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },

          variant: {
            select: {
              id: true,
              weight: true,
              price: true,
            },
          },
        },
      },
    },
  });
}

// --------------------------------------------------
// Update order status
// --------------------------------------------------

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError("Order not found",404);
  }

  const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  if (!allowedStatuses.includes(status)) {
    throw new AppError(
      `Invalid order status transition from ${order.status} to ${status}`,
      409,
    );
  }

  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });
}

// --------------------------------------------------
// Save the Razorpay order ID against an existing
// database order
// --------------------------------------------------

export async function attachRazorpayOrderId(
  orderId: number,
  razorpayOrderId: string,
  userId: number,
) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentMethod !== "RAZORPAY") {
    throw new Error("This order is not a Razorpay order");
  }

  if (order.paymentStatus !== "PENDING") {
    throw new Error("This order is no longer pending");
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      razorpayOrderId,
    },
  });

  return updatedOrder;
}

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          variant: {
            select: {
              id: true,
              weight: true,
              price: true,
            },
          },
        },
      },
    },
  });
}

export async function getOrderById(orderId: number) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          variant: {
            select: {
              id: true,
              weight: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
}