// import "dotenv/config";
// import prisma from "../src/lib/prisma";

// const products = await prisma.product.findMany({
//   select: {
//     id: true,
//     name: true,
//     variants: {
//       select: {
//         price: true,
//       },
//     },
//   },

//   orderBy: {
//     variants: {
//       _min: {
//         price: "asc",
//       },
//     },
//   },

//   take: 5,
// });

// console.log(products);

// await prisma.$disconnect();