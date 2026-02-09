"use client";

import { useEffect, useState } from "react";
import Header from "@/components/public/Header";
import CategoryNav from "@/components/public/CategoryNav";
import CategoryCard from "@/components/public/CategoryCard";
import ItemCard from "@/components/public/ItemCard";
import CartButton from "@/components/public/CartButton";

interface Settings {
  restaurantName: string;
  logoUrl?: string | null;
  address?: string | null;
  mapUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  extraInfo?: string | null;
  currency: string;
}

interface SubCategory {
  id: string;
  name_ar: string;
  imageUrl?: string | null;
}

interface Category {
  id: string;
  name_ar: string;
  imageUrl?: string | null;
  children?: SubCategory[];
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
}

function MenuContent() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then(setSettings);
    fetch("/api/public/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    const url = search
      ? `/api/public/items?search=${encodeURIComponent(search)}`
      : "/api/public/items";
    fetch(url)
      .then((r) => r.json())
      .then(setItems);
  }, [search]);

  useEffect(() => {
    if (categories.length && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const currentCategory = categories.find((c) => c.id === activeCategory);
  const hasSubCategories = (currentCategory?.children?.length ?? 0) > 0;
  const subCategories = currentCategory?.children ?? [];

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
  };

  return (
    <div className="min-h-screen pb-28 w-full max-w-[100vw] overflow-x-hidden" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))", background: "linear-gradient(180deg, #fef7ed 0%, #f5f0e8 50%, #fef3e8 100%)" }}>
      {settings && <Header settings={settings} />}
      <CategoryNav
        categories={categories}
        activeId={activeCategory}
        onSelect={handleSelectCategory}
      />

      {/* Search bar */}
      <div className="px-4 py-3 w-full max-w-full">
        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/90 shadow-sm border border-orange-100/60">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث"
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-center"
          />
        </div>
      </div>

      <div className="px-4 pb-8 w-full max-w-full min-w-0">
        {/* Sub-category cards (فواكه، خضروات، ورقيات) when فواكه و خضروات is selected */}
        {hasSubCategories && !search && (
          <div className="grid gap-4 mb-6">
            {subCategories.map((sub) => (
              <CategoryCard
                key={sub.id}
                category={sub}
                href={`/ar/category/${sub.id}`}
              />
            ))}
          </div>
        )}

        {/* غذائيات و منظفات: no sub-categories - show single folder card linking to category page */}
        {!hasSubCategories && currentCategory && !search && (
          <div className="grid gap-4 mb-6">
            <CategoryCard
              category={{ id: currentCategory.id, name_ar: currentCategory.name_ar, imageUrl: currentCategory.imageUrl }}
              href={`/ar/category/${currentCategory.id}`}
            />
          </div>
        )}

        {/* Search results - only when user is searching */}
        {search && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">نتائج البحث</h2>
            <div className="grid gap-4">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  settings={{ currency: settings?.currency ?? "IQD" }}
                />
              ))}
              {items.length === 0 && (
                <p className="text-gray-500 text-center py-8">لا توجد نتائج</p>
              )}
            </div>
          </div>
        )}
      </div>

      <CartButton />
    </div>
  );
}

export default function MenuPage() {
  return <MenuContent />;
}
