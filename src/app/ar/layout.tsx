import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "القائمة",
  description: "قائمة المتجر - اطلب عبر واتساب",
};

export default function ArLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </div>
    </CartProvider>
  );
}
