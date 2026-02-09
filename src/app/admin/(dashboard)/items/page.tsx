"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Category {
  id: string;
  name_ar: string;
}

interface Item {
  id: string;
  name_ar: string;
  desc_ar?: string | null;
  priceInt: number;
  oldPriceInt?: number | null;
  imagePath?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId: string;
  category: { name_ar: string };
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name_ar: "",
    desc_ar: "",
    priceInt: 0,
    oldPriceInt: "" as string | number,
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadItems = () => fetch("/api/admin/items").then((r) => r.json()).then(setItems);
  const loadCategories = () => fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);

  useEffect(() => {
    Promise.all([loadItems(), loadCategories()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categories.length && !form.categoryId) {
      setForm((f) => ({ ...f, categoryId: categories[0].id }));
    }
  }, [categories, form.categoryId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setForm((f) => ({ ...f, imageUrl: data.url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      priceInt: Number(form.priceInt) || 0,
      oldPriceInt: form.oldPriceInt ? Number(form.oldPriceInt) : undefined,
      imagePath: form.imageUrl || undefined,
      imageUrl: form.imageUrl || undefined,
    };
    const url = editing ? `/api/admin/items/${editing.id}` : "/api/admin/items";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "فشل الحفظ");
      return;
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name_ar: "", desc_ar: "", priceInt: 0, oldPriceInt: "", categoryId: form.categoryId, imageUrl: "", isAvailable: true });
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا الصنف؟")) return;
    await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    loadItems();
  };

  const handleEdit = (item: Item) => {
    setEditing(item);
    setForm({
      name_ar: item.name_ar,
      desc_ar: item.desc_ar ?? "",
      priceInt: item.priceInt,
      oldPriceInt: item.oldPriceInt ?? "",
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? item.imagePath ?? "",
      isAvailable: item.isAvailable,
    });
    setShowForm(true);
  };

  const imgUrl = (item: Item) => item.imageUrl || item.imagePath;
  const q = search.trim().toLowerCase();
  const filteredItems = items.filter(
    (i) =>
      i.name_ar.toLowerCase().includes(q) ||
      (i.desc_ar ?? "").toLowerCase().includes(q) ||
      i.category.name_ar.toLowerCase().includes(q)
  );
  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      name_ar: "",
      desc_ar: "",
      priceInt: 0,
      oldPriceInt: "",
      categoryId: categories[0]?.id ?? "",
      imageUrl: "",
      isAvailable: true,
    });
  };

  const block = { marginBottom: "16px" };
  const label = { display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "6px" };
  const input = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  };
  const card = { background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>الأصناف</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 12px 0" }}>إدارة منتجات القائمة</p>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن صنف أو فئة..."
          style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "16px", boxSizing: "border-box" as const, marginBottom: "12px" }}
        />

        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({
              name_ar: "",
              desc_ar: "",
              priceInt: 0,
              oldPriceInt: "",
              categoryId: categories[0]?.id ?? "",
              imageUrl: "",
              isAvailable: true,
            });
          }}
          style={{
            width: "100%",
            padding: "14px",
            background: "#e85d04",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + إضافة صنف
        </button>
      </div>

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            padding: "16px",
          }}
          onClick={resetForm}
        >
          <div
            style={{ ...card, maxWidth: "420px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>{editing ? "تعديل الصنف" : "صنف جديد"}</h3>
          {error && (
            <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={block}>
              <label style={label}>الاسم</label>
              <input type="text" value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} style={input} required />
            </div>
            <div style={block}>
              <label style={label}>الوصف</label>
              <input type="text" value={form.desc_ar} onChange={(e) => setForm((f) => ({ ...f, desc_ar: e.target.value }))} placeholder="اختياري" style={input} />
            </div>
            <div style={block}>
              <label style={label}>السعر (IQD)</label>
              <input type="number" value={form.priceInt || ""} onChange={(e) => setForm((f) => ({ ...f, priceInt: parseInt(e.target.value, 10) || 0 }))} style={input} min={0} />
            </div>
            <div style={block}>
              <label style={label}>السعر القديم للتخفيض</label>
              <input type="number" value={form.oldPriceInt || ""} onChange={(e) => setForm((f) => ({ ...f, oldPriceInt: e.target.value ? parseInt(e.target.value, 10) : "" }))} placeholder="فارغ = لا تخفيض" style={input} min={0} />
            </div>
            <div style={block}>
              <label style={label}>الفئة</label>
              <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} style={input}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
            </div>
            <div style={block}>
              <label style={label}>الصورة</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="ارفع صورة أو الصق رابطاً" style={input} />
              <label style={{ display: "block", marginTop: "8px", padding: "12px", background: "#e85d04", color: "white", borderRadius: "12px", textAlign: "center", fontWeight: 600, cursor: "pointer" }}>
                {uploading ? "جاري..." : "رفع صورة"}
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} disabled={uploading} />
              </label>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} style={{ width: "20px", height: "20px" }} />
              <span style={{ fontWeight: 500 }}>متوفر للطلب</span>
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" style={{ flex: 1, padding: "12px", background: "#e85d04", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>
                حفظ
              </button>
              <button type="button" onClick={resetForm} style={{ flex: 1, padding: "12px", background: "white", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "12px", fontWeight: 600, cursor: "pointer" }}>
                إلغاء
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={card}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
              {imgUrl(item) ? (
                <div style={{ position: "relative", width: 56, height: 56, borderRadius: "12px", overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                  <Image src={imgUrl(item)!} alt={item.name_ar} fill style={{ objectFit: "cover" }} sizes="56px" />
                </div>
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: "12px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                  🍽️
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#111827", wordBreak: "break-word" }}>{item.name_ar}</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>
                  {item.category.name_ar} · {item.priceInt.toLocaleString("ar-IQ")} د.ع
                </p>
                <span style={{ display: "inline-block", marginTop: "6px", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", background: item.isAvailable ? "#dcfce7" : "#f3f4f6", color: item.isAvailable ? "#166534" : "#6b7280" }}>
                  {item.isAvailable ? "متوفر" : "غير متوفر"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleEdit(item)}
                style={{ flex: 1, padding: "10px", color: "#e85d04", fontWeight: 600, border: "1px solid #e85d04", borderRadius: "10px", background: "white", cursor: "pointer" }}
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ flex: 1, padding: "10px", color: "#dc2626", fontWeight: 600, border: "1px solid #fca5a5", borderRadius: "10px", background: "white", cursor: "pointer" }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
