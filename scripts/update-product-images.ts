// scripts/update-product-images.ts

import "dotenv/config";
import prisma from "../src/lib/prisma";

const productImages = [
//   {
//     slug: "mango-pickle",
//     image:
//       "https://res.cloudinary.com/c8cel31e/image/upload/v1789699219/Mango.png",
//   },
//   {
//     slug: "amla-pickle",
//     image:
//       "https://res.cloudinary.com/c8cel31e/image/upload/v1789699178/Amla.png",
//   },
//   {
//     slug: "ginger-pickle",
//     image:
//       "https://res.cloudinary.com/c8cel31e/image/upload/v1789699188/Ginger.png",
//   },
    {
    slug: "garlic-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699189/Garlic.png",
  },
  {
    slug: "green-stuffed-chilli-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699198/Greenbarwamirch.png",
  },
    {
    slug: "red-stuffed-chilli-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699228/Redchilli.png",
  },
  {
    slug: "green-chilli-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699198/Greenchili.png",
  },
  {
    slug: "jackfruit-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699199/Jackfruit.png",
  },
   {
    slug: "kachi-haldi-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699198/Haldi.png",
  },
  {
    slug: "lemon-sour-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699210/Lemonsour.png",
  },
   {
    slug: "lemon-sweet-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699219/Lemonsweet.png",
  },
  {
    slug: "mango-mixed-pickle",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699219/MangoMixed.png",
  },
  {
    slug: "rock-salt",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699230/Rock_salt.png",
  },
   {
    slug: "haldi-powder",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699199/Haldi_powder.png",
  },
   {
    slug: "laal-mirch",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699221/Red_chilli_powder.png",
  },
  {
    slug: "ginger-powder",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699199/Ginger_powder.png",
  },
  {
    slug: "bhang-seeds",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699179/Bhangseeds.png",
  },
    {
    slug: "bhangjeera",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699179/Bhangzeer.png",
  },
  {
    slug: "jhakya",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699210/Jhakya.png",
  },
   {
    slug: "naurangi-dal",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699220/Naurangi.png",
  },
  {
    slug: "toar-dal",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699230/Toar.png",
  },
   {
    slug: "kala-bhat",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699209/Kala_bhat.png",
  },
   {
    slug: "safed-bhat",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699230/Safed_bhat.png",
  },
   {
    slug: "rajma",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699221/Rajma.png",
  },
  {
    slug: "gaath",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699179/Gahat.png",
  },
  {
    slug: "laal-bhat",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699210/Lal_bhat.png",
  },
   {
    slug: "koda-atta",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699211/Koda.png",
  },
  {
    slug: "jhangora",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699210/Jhangora.png",
  },
   {
    slug: "awala-murabba",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699189/Amla_murabba.png",
  },
  {
    slug: "gajar-murabba",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699189/Gajar_murabba.png",
  },
   {
    slug: "awala-laddo",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699179/Amla_laddo.png",
  },
   {
    slug: "aam-laddo",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789696108/Aam_laddo.png",
  },
  {
    slug: "awala-jam",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699188/Awla_jam.png",
  },
    {
    slug: "awala-candy",
    image:
      "https://res.cloudinary.com/c8cel31e/image/upload/v1789699189/Awla_candy.png",
  },
];

async function main() {
  for (const product of productImages) {
    await prisma.product.update({
      where: {
        slug: product.slug,
      },
      data: {
        image: product.image,
      },
    });

    console.log(`Updated image for: ${product.slug}`);
  }
}

main()
  .catch((error) => {
    console.error("Image update failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });