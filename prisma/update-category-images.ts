/**
 * One-time script to add images to غذائيات and منظفات و صحيات categories.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/update-category-images.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMAGES = {
  غذائيات: "https://dyj6gt4964deb.cloudfront.net/images/crop-eb3c7a00-c31e-4921-8540-09b7e3d86eb5.jpeg",
  "منظفات و صحيات": "https://dyj6gt4964deb.cloudfront.net/images/crop-fd5b756c-0090-4d61-b16e-e0b0d9f3b85d.jpeg",
};

async function main() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  for (const cat of categories) {
    const name = cat.name_ar.trim();
    // Match غذائيات / غذائیات / غذائيات (various spellings)
    if (name.includes("غذائ") || name.includes("غذائی")) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { imageUrl: IMAGES.غذائيات },
      });
      console.log(`Updated ${name} with غذائيات image`);
    }
    // Match منظفات و صحة / منظفات و صحيات
    if (name.includes("منظفات")) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { imageUrl: IMAGES["منظفات و صحيات"] },
      });
      console.log(`Updated ${name} with منظفات image`);
    }
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
