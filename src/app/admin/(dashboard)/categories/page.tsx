"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name_ar: string;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { items: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredCategories = categories.filter((c) =>
    c.name_ar.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_ar: name, parentId: parentId || null, imageUrl: imageUrl || undefined, isActive: true, sortOrder: 0 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "فشل الحفظ");
      return;
    }
    setShowForm(false);
    setEditing(null);
    setName("");
    setParentId("");
    setImageUrl("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه الفئة؟")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  };

  const handleEdit = (c: Category) => {
    setEditing(c);
    setName(c.name_ar);
    setParentId(c.parentId ?? "");
    setImageUrl(c.imageUrl ?? "");
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setImageUploading(false);
    if (res.ok) setImageUrl(data.url);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName("");
    setParentId("");
    setImageUrl("");
    setError("");
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
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#111827" }}>الفئات</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>إدارة تصنيفات القائمة</p>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن فئة..."
          style={{ ...input, padding: "10px 14px" }}
        />

        <button
          onClick={() => { setShowForm(true); setEditing(null); setName(""); setParentId(""); setImageUrl(""); }}
          style={{
            padding: "14px",
            background: "#e85d04",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
          }}
        >
          + إضافة فئة
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
            style={{ ...card, maxWidth: "400px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>{editing ? "تعديل الفئة" : "فئة جديدة"}</h3>
            {error && (
              <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={block}>
                <label style={label}>اسم الفئة</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: فواكه و خضروات" style={input} required />
              </div>
              <div style={block}>
                <label style={label}>الفئة الأم</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={input}>
                  <option value="">فئة رئيسية</option>
                  {categories.filter((c) => !c.parentId).map((c) => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>
              <div style={block}>
                <label style={label}>صورة الفئة</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="ارفع صورة أو الصق رابطاً" style={input} />
                <label style={{ display: "block", marginTop: "8px", padding: "12px", background: "#e85d04", color: "white", borderRadius: "12px", textAlign: "center", fontWeight: 600, cursor: "pointer" }}>
                  {imageUploading ? "جاري..." : "رفع صورة"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={imageUploading} />
                </label>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
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
        {filteredCategories.map((c) => (
          <div key={c.id} style={{ ...card, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827", wordBreak: "break-word" }}>{c.name_ar}</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>{c._count.items.toLocaleString("ar-IQ")} منتج</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleEdit(c)}
                style={{ flex: 1, padding: "10px", color: "#e85d04", fontWeight: 600, border: "1px solid #e85d04", borderRadius: "10px", background: "white", cursor: "pointer" }}
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(c.id)}
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
