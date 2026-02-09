"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";

interface Settings {
  restaurantName: string;
  whatsapp?: string | null;
  phone?: string | null;
  currency: string;
  mode: string;
  messageFooter?: string | null;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableOrAddress, setTableOrAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const isDineIn = settings?.mode === "dine-in";
  const label = isDineIn ? "رقم الطاولة" : "العنوان";
  const placeholder = isDineIn ? "مثال: 5" : "أدخل العنوان للتوصيل";

  const handleWhatsApp = () => {
    if (!settings?.whatsapp) return;
    const msg = buildWhatsAppMessage(
      items,
      settings,
      customerName || undefined,
      customerPhone || undefined,
      tableOrAddress || undefined,
      notes || undefined
    );
    const url = getWhatsAppUrl(settings.whatsapp, msg);
    window.open(url, "_blank");
  };

  const handleCall = () => {
    if (!settings?.phone) return;
    window.location.href = `tel:${settings.phone}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 text-lg mb-4">السلة فارغة</p>
        <Link
          href="/ar"
          className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600"
        >
          تصفح القائمة
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-[100vw] overflow-x-hidden" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/ar" className="text-amber-600 font-semibold">
            ← العودة
          </Link>
          <h1 className="text-lg font-bold">السلة</h1>
          <div />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 w-full max-w-full min-w-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{item.name_ar}</h3>
              {item.notes ? (
                <p className="text-sm text-gray-500">ملاحظة: {item.notes}</p>
              ) : null}
              <p className="text-amber-600 font-bold">
                {item.priceInt.toLocaleString("ar-IQ")} × {(item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1))} كغ ={" "}
                {Math.round(item.priceInt * item.quantity).toLocaleString("ar-IQ")}{" "}
                {settings?.currency ?? "IQD"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 0.5)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-gray-100 text-gray-700 font-bold touch-manipulation"
                aria-label="تخفيف"
              >
                −
              </button>
              <span className="w-12 text-center font-bold">
                {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)} كغ
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 0.5)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-gray-100 text-gray-700 font-bold touch-manipulation"
                aria-label="زيادة"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-500 touch-manipulation"
              aria-label="حذف"
            >
              🗑️
            </button>
          </div>
        ))}

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h2 className="font-bold text-gray-800">معلومات الطلب</h2>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="الاسم (اختياري)"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="الهاتف (اختياري)"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
          <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
              type="text"
              value={tableOrAddress}
              onChange={(e) => setTableOrAddress(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية (اختياري)"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-lg font-bold text-gray-900">
            الإجمالي: {totalPrice.toLocaleString("ar-IQ")} {settings?.currency ?? "IQD"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {settings?.whatsapp ? (
            <button
              onClick={handleWhatsApp}
              className="w-full py-4 min-h-[52px] bg-green-500 text-white font-bold rounded-full hover:bg-green-600 flex items-center justify-center gap-2 touch-manipulation"
            >
              <span>📱</span>
              اطلب عبر واتساب
            </button>
          ) : null}
          {settings?.phone ? (
            <button
              onClick={handleCall}
              className="w-full py-4 min-h-[52px] bg-[#e85d04] text-white font-bold rounded-full hover:bg-[#d14d04] flex items-center justify-center gap-2 touch-manipulation"
            >
              <span>📞</span>
              اتصل الآن
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
