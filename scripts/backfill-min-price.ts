import "dotenv/config";
import prisma from "../src/lib/prisma";

async function backfillMinPrice() {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        select: {
          price: true,
        },
      },
    },
  });

  for (const product of products) {
    if (product.variants.length === 0) {
      console.log(`Skipping ${product.name}: no variants`);
      continue;
    }

    const minPrice = product.variants.reduce(
      (minimum, variant) => {
        return variant.price.lessThan(minimum)
          ? variant.price
          : minimum;
      },
      product.variants[0].price,
    );

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        minPrice,
      },
    });

    console.log(`✓ ${product.name} → ${minPrice}`);
  }

  console.log("Min price backfill completed.");
}

backfillMinPrice()
  .catch((error) => {
    console.error("Min price backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });