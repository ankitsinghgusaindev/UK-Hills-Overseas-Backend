import "dotenv/config";
import prisma from "../src/lib/prisma";
import { updateVariantPrice } from "../src/services/variant.service";
import { Prisma } from "../src/generated/prisma/client";

async function testVariantService() {
  const variantId = 1;

  const before = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    select: {
      id: true,
      price: true,
      weight: true,
      product: {
        select: {
          name: true,
          minPrice: true,
        },
      },
    },
  });

  console.log("BEFORE:");
  console.log(before);

  if (!before) {
    throw new Error("Variant not found");
  }

  const originalPrice = before.price;

  // Temporarily change ₹149 → ₹199
 const result = await updateVariantPrice(
  variantId,
  new Prisma.Decimal("199"),
);

  console.log("\nTRANSACTION RESULT:");
  console.log(result);

  const after = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    select: {
      id: true,
      price: true,
      weight: true,
      product: {
        select: {
          name: true,
          minPrice: true,
        },
      },
    },
  });

  console.log("\nAFTER:");
  console.log(after);

  // Restore original price
  await updateVariantPrice(variantId, originalPrice);

  console.log("\nRESTORED:");
  
  const restored = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    select: {
      id: true,
      price: true,
      product: {
        select: {
          name: true,
          minPrice: true,
        },
      },
    },
  });

  console.log(restored);

  await prisma.$disconnect();
}

testVariantService().catch(async (error) => {
  console.error("TEST FAILED:", error);
  await prisma.$disconnect();
  process.exit(1);
});