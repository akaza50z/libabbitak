"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/public/Header";
import ItemCard from "@/components/public/ItemCard";
import CartButton from "@/components/public/CartButton";

interface Settings {
  restaurantName: string;
  logoUrl?: string | null;
  currency: string;
}

interface Item {
  id: string;
  name_ar: string;
  desc_ar?: string | null;
  priceInt: number;
  oldPriceInt?: number | null;
  imagePath?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  category?: { name_ar: string; id: string };
}

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [settings, setSettings] = useState<Settings | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/public/items?category=${encodeURIComponent(id)}`).then((r) => r.json()),
      fetch("/api/public/categories").then((r) => r.json()),
    ])
      .then(([data, cats]) => {
        setItems(data);
        const name = data[0]?.category?.name_ar;
        if (name) {
          setCategoryName(name);
        } else {
          for (const p of cats as { id: string; name_ar: string; children?: { id: string; name_ar: string }[] }[]) {
            if (p.id === id) { setCategoryName(p.name_ar); break; }
            const child = (p.children ?? []).find((c) => c.id === id);
            if (child) { setCategoryName(child.name_ar); break; }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] pb-24">
      {settings && <Header settings={settings} />}

      <div className="px-4 py-3 bg-white/80 border-b border-orange-100">
        <Link
          href="/ar"
          className="inline-flex items-center gap-2 text-[#e85d04] font-medium hover:underline"
        >
          <span className="text-xl">←</span>
          <span>رجوع</span>
        </Link>
      </div>

      <div className="px-4 py-6 w-full max-w-full min-w-0">
        {categoryName && (
          <h1 className="text-xl font-bold text-gray-800 mb-6">{categoryName}</h1>
        )}
        {loading ? (
          <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white/60 rounded-xl">
            لا توجد منتجات في هذا التصنيف
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                settings={{ currency: settings?.currency ?? "IQD" }}
              />
            ))}
          </div>
        )}
      </div>

      <CartButton />
    </div>
  );
}
