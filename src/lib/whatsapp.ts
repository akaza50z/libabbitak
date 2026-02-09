import { CartItem } from "@/context/CartContext";

interface Settings {
  restaurantName: string;
  whatsapp?: string | null;
  phone?: string | null;
  currency: string;
  mode: string;
  messageFooter?: string | null;
}

export function buildWhatsAppMessage(
  items: CartItem[],
  settings: Settings,
  customerName?: string,
  customerPhone?: string,
  tableOrAddress?: string,
  orderNotes?: string
): string {
  const lines: string[] = [];
  const cur = settings.currency;

  // Header (no emojis - avoid rendering issues on some devices)
  lines.push(`*طلب جديد — ${settings.restaurantName}*`);
  lines.push("");
  lines.push(`التاريخ: ${new Date().toLocaleDateString("ar-IQ")}  |  الوقت: ${new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}`);
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━");
  lines.push("");

  lines.push("*تفاصيل الطلب:*");
  lines.push("");

  let subtotal = 0;
  let totalKg = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const lineTotal = Math.round(item.priceInt * item.quantity);
    subtotal += lineTotal;
    totalKg += item.quantity;

    const num = (i + 1).toLocaleString("ar-IQ");
    const qtyStr = item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toFixed(1);
    const total = lineTotal.toLocaleString("ar-IQ");

    lines.push(`  ${num}. *${item.name_ar}*`);
    lines.push(`     ${qtyStr} كغ × ${item.priceInt.toLocaleString("ar-IQ")} ${cur} = ${total} ${cur}`);
    if (item.notes) {
      lines.push(`     ملاحظة: _${item.notes}_`);
    }
    lines.push("");
  }

  // ═══ Totals ═══
  lines.push("─────────────────");
  lines.push(`  الوزن الكلي: ${totalKg % 1 === 0 ? totalKg : totalKg.toFixed(1)} كغ`);
  lines.push(`  *الإجمالي: ${subtotal.toLocaleString("ar-IQ")} ${cur}*`);
  lines.push("");

  // ═══ Customer info ═══
  const hasInfo = tableOrAddress || customerName || customerPhone || orderNotes;
  if (hasInfo) {
    lines.push("━━━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("*معلومات العميل:*");
    lines.push("");

    if (settings.mode === "dine-in" && tableOrAddress) {
      lines.push(`  الطاولة: ${tableOrAddress}`);
    }
    if (settings.mode === "delivery" && tableOrAddress) {
      lines.push(`  العنوان: ${tableOrAddress}`);
    }
    if (customerName) {
      lines.push(`  الاسم: ${customerName}`);
    }
    if (customerPhone) {
      lines.push(`  الهاتف: ${customerPhone}`);
    }
    if (orderNotes) {
      lines.push(`  ملاحظات: ${orderNotes}`);
    }
    lines.push("");
  }

  // ═══ Footer ═══
  if (settings.messageFooter) {
    lines.push("─────────────────");
    lines.push("");
    lines.push(settings.messageFooter);
    lines.push("");
  }

  lines.push("يرجى تأكيد الطلب.");

  return lines.join("\n");
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const number = cleaned.startsWith("964") ? cleaned : `964${cleaned.replace(/^0/, "")}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
