import "dotenv/config";
import prisma from "../src/lib/prisma";

async function testDatabase() {
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();

  console.log({
    categoryCount,
    productCount,
    variantCount,
  });
}

testDatabase()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });