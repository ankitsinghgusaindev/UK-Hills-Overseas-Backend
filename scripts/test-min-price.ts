import "dotenv/config";
import prisma from "../src/lib/prisma";

async function testMinPrice() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      minPrice: true,
    },
    orderBy: {
      minPrice: "asc",
    },
  });

  console.table(products);

  await prisma.$disconnect();
}

testMinPrice().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});