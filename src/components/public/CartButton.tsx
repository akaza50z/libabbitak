"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const { totalCount, totalPrice } = useCart();
  if (totalCount === 0) return null;
  return (
    <Link
      href="/ar/cart"
      className="fixed left-4 right-4 z-40 flex items-center justify-center gap-6 px-5 py-4 text-white rounded-2xl shadow-lg max-w-md mx-auto min-h-[56px] sm:left-6 sm:right-6 transition-all hover:shadow-xl"
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom))",
        background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
      }}
    >
      <span className="font-bold text-lg drop-shadow-sm">
        السلة ({totalCount % 1 === 0 ? totalCount : totalCount.toFixed(1)} كغ)
      </span>
      <span className="font-bold text-lg drop-shadow-sm">
        {totalPrice.toLocaleString("ar-IQ")} د.ع
      </span>
    </Link>
  );
}
