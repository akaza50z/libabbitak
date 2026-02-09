/**
 * Update products with image URLs and prices from lbab_beytk_products_final.csv
 * Run: npx tsx prisma/update-from-csv.ts
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

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
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else if (c !== "\r" && c !== "\n") {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  const candidates = [
    path.join(process.cwd(), "lbab_beytk_products_final.csv"),
    path.join(process.cwd(), "prisma", "data", "lbab_beytk_products_final.csv"),
    path.join(process.cwd(), "..", "lbab_beytk_products_final.csv"),
  ];
  const csvPath = candidates.find((p) => fs.existsSync(p));
  if (!csvPath) {
    console.error("CSV not found. Place lbab_beytk_products_final.csv in project root or prisma/data/");
    process.exit(1);
  }
  console.log("Using CSV:", csvPath);

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());

  const items = await prisma.item.findMany({ include: { category: true } });
  const byNameAndCat = new Map<string, { id: string; name_ar: string; category: { name_ar: string } }>();
  for (const item of items) {
    byNameAndCat.set(`${item.name_ar}|${item.category.name_ar}`, item);
  }

  let updated = 0;
  const csvNames = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVRow(lines[i]);
    if (cols.length < 5) continue;
    const [category, name, , price, imageUrl] = cols;
    const categoryAr = CSV_CATEGORY_TO_ARABIC[category];
    if (!categoryAr) continue;

    const key = `${name}|${categoryAr}`;
    csvNames.add(key);
    const item = byNameAndCat.get(key);
    if (!item) {
      console.warn("No match in DB:", name, "(", category, ")");
      continue;
    }

    const priceInt = parsePrice(price);
    const img = imageUrl && imageUrl.startsWith("http") ? imageUrl : null;

    await prisma.item.update({
      where: { id: item.id },
      data: { imageUrl: img ?? undefined, priceInt },
    });
    updated++;
  }

  // Find items still without image
  const after = await prisma.item.findMany({ select: { name_ar: true, imageUrl: true, category: { select: { name_ar: true } } } });
  const noImage = after.filter((i) => !i.imageUrl || i.imageUrl === "");

  console.log(`Updated ${updated} products with images and prices from CSV.`);
  if (noImage.length > 0) {
    console.log("\nProducts with NO image:");
    noImage.forEach((i) => console.log(`  - ${i.name_ar} (${i.category.name_ar})`));
  } else {
    console.log("\nAll products have images.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
