import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type JsonProduct = { name: string; description: string; image_url: string; price: string; category: string };
const CATEGORY_TO_SUB: Record<string, "subFruits" | "subVeg" | "subLeafy" | "catGroceries" | "catCleaners"> = {
  Fruits: "subFruits",
  Vegetables: "subVeg",
  "Leafy Greens": "subLeafy",
  Groceries: "catGroceries",
  "Detergents & Health": "catCleaners",
};

async function main() {
  // Restaurant settings - Lbab Beytk
  let settings = await prisma.restaurantSettings.findFirst();
  if (!settings) {
    settings = await prisma.restaurantSettings.create({
      data: {
        restaurantName: "لباب بيتك",
        address: "IRAQ - MOSUL - AL-MASRF STREET, MOSUL, IRAQ",
        mapUrl: "https://maps.app.goo.gl/poWUyUJc9B4hTUvc9",
        phone: "07704855444",
        whatsapp: "9647704855444",
        facebookUrl: "",
        instagramUrl: "",
        currency: "IQD",
        mode: "delivery",
        isOpen: true,
        extraInfo:
          "خدمة ممتازة وتوصيل سريع - للطلب المباشر اتصل على الرقم 07704855444 او الواتساب او الصفحات الخاصة بنا\nفواكه وخضروات طازجة توصلك وين ما تكون داخل الموصل\nاحصل على جميع احتياجاتك عبر تطبيق لباب بيتك",
        messageFooter: "شكراً لزيارتكم",
      },
    });
  } else {
    await prisma.restaurantSettings.update({
      where: { id: settings.id },
      data: {
        restaurantName: "لباب بيتك",
        address: "IRAQ - MOSUL - AL-MASRF STREET, MOSUL, IRAQ",
        mapUrl: "https://maps.app.goo.gl/poWUyUJc9B4hTUvc9",
        phone: "07704855444",
        whatsapp: "9647704855444",
        extraInfo:
          "خدمة ممتازة وتوصيل سريع - للطلب المباشر اتصل على الرقم 07704855444 او الواتساب او الصفحات الخاصة بنا\nفواكه وخضروات طازجة توصلك وين ما تكون داخل الموصل\nاحصل على جميع احتياجاتك عبر تطبيق لباب بيتك",
      },
    });
  }

  // Top-level categories (no parent)
  let catFruitsVeg = await prisma.category.findFirst({ where: { name_ar: "فواكه و خضروات", parentId: null } });
  if (!catFruitsVeg) {
    catFruitsVeg = await prisma.category.create({
      data: { name_ar: "فواكه و خضروات", parentId: null, sortOrder: 0, isActive: true },
    });
  }
  const IMG_GROCERIES = "https://dyj6gt4964deb.cloudfront.net/images/crop-eb3c7a00-c31e-4921-8540-09b7e3d86eb5.jpeg";
  const IMG_CLEANERS = "https://dyj6gt4964deb.cloudfront.net/images/crop-fd5b756c-0090-4d61-b16e-e0b0d9f3b85d.jpeg";

  let catGroceries = await prisma.category.findFirst({ where: { name_ar: "غذائیات", parentId: null } });
  if (!catGroceries) {
    catGroceries = await prisma.category.create({
      data: { name_ar: "غذائیات", parentId: null, sortOrder: 1, isActive: true, imageUrl: IMG_GROCERIES },
    });
  } else {
    await prisma.category.update({ where: { id: catGroceries.id }, data: { imageUrl: IMG_GROCERIES } });
  }
  let catCleaners = await prisma.category.findFirst({ where: { name_ar: "منظفات و صحة", parentId: null } });
  if (!catCleaners) {
    catCleaners = await prisma.category.create({
      data: { name_ar: "منظفات و صحة", parentId: null, sortOrder: 2, isActive: true, imageUrl: IMG_CLEANERS },
    });
  } else {
    await prisma.category.update({ where: { id: catCleaners.id }, data: { imageUrl: IMG_CLEANERS } });
  }

  // Sub-categories under فواكه و خضروات
  let subFruits = await prisma.category.findFirst({ where: { name_ar: "فواكه", parentId: catFruitsVeg.id } });
  if (!subFruits) {
    subFruits = await prisma.category.create({
      data: { name_ar: "فواكه", parentId: catFruitsVeg.id, sortOrder: 0, isActive: true },
    });
  }
  let subVeg = await prisma.category.findFirst({ where: { name_ar: "خضروات", parentId: catFruitsVeg.id } });
  if (!subVeg) {
    subVeg = await prisma.category.create({
      data: { name_ar: "خضروات", parentId: catFruitsVeg.id, sortOrder: 1, isActive: true },
    });
  }
  let subLeafy = await prisma.category.findFirst({ where: { name_ar: "ورقيات", parentId: catFruitsVeg.id } });
  if (!subLeafy) {
    subLeafy = await prisma.category.create({
      data: { name_ar: "ورقيات", parentId: catFruitsVeg.id, sortOrder: 2, isActive: true },
    });
  }

  const categoryMap = {
    subFruits: subFruits,
    subVeg: subVeg,
    subLeafy: subLeafy,
    catGroceries: catGroceries,
    catCleaners: catCleaners,
  };

  // Import products from JSON
  const jsonPath = path.join(__dirname, "data", "all_products.json");
  let didImport = false;
  if (!fs.existsSync(jsonPath)) {
    console.warn("all_products.json not found at prisma/data/all_products.json, skipping product import");
  } else {
    const existingCount = await prisma.item.count();
    if (existingCount > 0) {
      console.log("Items already exist, skipping product import (run with empty DB to reimport)");
    } else {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const products: JsonProduct[] = JSON.parse(raw);
      let sortOrder = 0;
      for (const p of products) {
        if (p.name === "لباب بيتك") continue;
        const key = CATEGORY_TO_SUB[p.category];
        if (!key) {
          console.warn(`Unknown category "${p.category}" for product "${p.name}", skipping`);
          continue;
        }
        const categoryId = categoryMap[key].id;
        const priceInt = /^\d+$/.test(p.price) ? parseInt(p.price, 10) : 0;
        await prisma.item.create({
          data: {
            name_ar: p.name,
            desc_ar: p.description || "",
            priceInt,
            imageUrl: p.image_url || null,
            categoryId,
            sortOrder: sortOrder++,
          },
        });
      }
      console.log(`Imported ${sortOrder} products from all_products.json`);
      didImport = true;
    }
  }

  // Apply CSV images and prices only when we just imported (never overwrite admin edits)
  if (didImport) {
    const csvPath = path.join(__dirname, "data", "lbab_beytk_products_final.csv");
    if (fs.existsSync(csvPath)) {
      const CSV_CATEGORY_TO_ARABIC: Record<string, string> = {
        Fruits: "فواكه",
        Vegetables: "خضروات",
        "Leafy Greens": "ورقيات",
        Groceries: "غذائیات",
        "Detergents & Health": "منظفات و صحة",
      };
      function parsePrice(priceStr: string): number {
        if (!priceStr || priceStr.trim() === "IQD") return 0;
        const match = priceStr.replace(/,/g, "").match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }
      function parseCSVRow(line: string): string[] {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') inQuotes = !inQuotes;
          else if (c === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else if (c !== "\r" && c !== "\n") current += c;
        }
        result.push(current.trim());
        return result;
      }
      const items = await prisma.item.findMany({ include: { category: true } });
      const byNameAndCat = new Map<string, { id: string }>();
      for (const item of items) {
        byNameAndCat.set(`${item.name_ar}|${item.category.name_ar}`, { id: item.id });
      }
      const raw = fs.readFileSync(csvPath, "utf-8");
      const lines = raw.split(/\r?\n/).filter((l) => l.trim());
      let updated = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVRow(lines[i]);
        if (cols.length < 5) continue;
        const [category, name, , price, imageUrl] = cols;
        const categoryAr = CSV_CATEGORY_TO_ARABIC[category];
        if (!categoryAr) continue;
        const key = `${name}|${categoryAr}`;
        const item = byNameAndCat.get(key);
        if (!item) continue;
        const priceInt = parsePrice(price);
        const img = imageUrl && imageUrl.startsWith("http") ? imageUrl : null;
        await prisma.item.update({
          where: { id: item.id },
          data: { imageUrl: img ?? undefined, priceInt },
        });
        updated++;
      }
      console.log(`Updated ${updated} products with images and prices from CSV`);
    }
  }

  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.adminUser.create({
      data: { username: "admin", passwordHash: hash },
    });
    console.log("Admin user created: username=admin, password=admin123");
  }

  console.log("Seed completed - Lbab Beytk");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
