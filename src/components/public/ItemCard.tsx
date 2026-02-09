"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface Item {
  id: string;
  name_ar: string;
  desc_ar?: string | null;
  priceInt: number;
  oldPriceInt?: number | null;
  imagePath?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
}

interface Settings {
  currency: string;
}

function getImageUrl(item: Item): string | null {
  if (item.imageUrl) return item.imageUrl;
  if (item.imagePath) return item.imagePath;
  return null;
}

export default function ItemCard({ item, settings }: { item: Item; settings: Settings }) {
  const { addItem } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [qty, setQty] = useState(1); // kg, step 0.5 (min 0.5)
  const [notes, setNotes] = useState("");
  const imgUrl = getImageUrl(item);
  const hasDiscount = item.oldPriceInt != null && item.oldPriceInt > item.priceInt;

  const handleAdd = () => {
    addItem(
      {
        itemId: item.id,
        name_ar: item.name_ar,
        priceInt: item.priceInt,
        notes: notes.trim() || undefined,
        imageUrl: imgUrl ?? undefined,
      },
      qty
    );
    setShowModal(false);
    setQty(1);
    setNotes("");
  };

  const step = 0.5;
  const minQty = 0.5;
  const adjustQty = (delta: number) => {
    setQty((q) => Math.round(Math.max(minQty, q + delta) * 10) / 10);
  };

  return (
    <>
      <article
        onClick={() => setShowModal(true)}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col w-full max-w-full min-w-0"
      >
        {/* Large image on top */}
        {imgUrl ? (
          <div className="relative w-full aspect-[4/3] bg-gray-100">
            <Image
              src={imgUrl}
              alt={item.name_ar}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-5xl text-gray-300">
            🍎
          </div>
        )}
        <div className="p-4 flex flex-row items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">{item.name_ar}</h3>
            {item.desc_ar ? (
              <p className="text-sm text-gray-500 mt-0.5">{item.desc_ar}</p>
            ) : null}
            <div className="flex items-center gap-2 mt-2">
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {item.oldPriceInt!.toLocaleString("ar-IQ")}
                </span>
              )}
              <span className="text-[#e85d04] font-bold">
                {item.priceInt.toLocaleString("ar-IQ")} {settings.currency}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(
                { itemId: item.id, name_ar: item.name_ar, priceInt: item.priceInt, imageUrl: imgUrl ?? undefined },
                0.5
              );
            }}
            className="w-12 h-12 min-w-[48px] min-h-[48px] shrink-0 rounded-full bg-[#e85d04] text-white flex items-center justify-center text-xl font-bold hover:bg-[#d14d04] transition-colors touch-manipulation"
            aria-label="إضافة"
          >
            +
          </button>
        </div>
      </article>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85dvh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {imgUrl ? (
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={imgUrl}
                  alt={item.name_ar}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              </div>
            ) : null}
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-900">{item.name_ar}</h2>
              {item.desc_ar ? (
                <p className="text-gray-500 mt-1">{item.desc_ar}</p>
              ) : null}
              <div className="flex items-center gap-2 mt-2">
                {hasDiscount && (
                  <span className="text-gray-400 line-through">
                    {item.oldPriceInt!.toLocaleString("ar-IQ")}
                  </span>
                )}
                <p className="text-[#e85d04] font-bold text-lg">
                  {item.priceInt.toLocaleString("ar-IQ")} {settings.currency}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات (اختياري)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بدون بصل"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustQty(-step)}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 touch-manipulation"
                    aria-label="تخفيف"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold">{qty % 1 === 0 ? qty : qty.toFixed(1)} كغ</span>
                  <button
                    onClick={() => adjustQty(step)}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 touch-manipulation"
                    aria-label="زيادة"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-4 px-4 min-h-[48px] bg-[#e85d04] text-white font-bold rounded-full hover:bg-[#d14d04] touch-manipulation"
                >
                  إضافة للسلة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
