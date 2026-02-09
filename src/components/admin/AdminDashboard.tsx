"use client";

import { useState, useEffect } from "react";

function AdminAccountCard() {
  const [username, setUsername] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    fetch("/api/admin/account")
      .then((r) => r.json())
      .then((d) => {
        setUsername(d.username ?? null);
        setNewUsername(d.username ?? "");
      })
      .catch(() => setUsername(null));
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة 6 أحرف على الأقل");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, newUsername: newUsername || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل التحديث");
        return;
      }
      setSuccess(true);
      setUsername(newUsername || username);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };
  const block = { marginBottom: "16px" };
  const label = { display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "6px" };
  const input = { width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "16px", boxSizing: "border-box" as const };
  const card = { background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
  if (username === null) return null;
  return (
    <div style={card}>
      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>حساب المسؤول</h3>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>تغيير اسم المستخدم وكلمة المرور</p>
      {error && <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px" }}>{error}</div>}
      {success && <div style={{ marginBottom: "16px", padding: "12px", background: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "14px" }}>تم التحديث بنجاح</div>}
      <form onSubmit={handleSubmit}>
        <div style={block}>
          <label style={label}>اسم المستخدم الحالي</label>
          <input type="text" value={username} readOnly style={{ ...input, background: "#f9fafb", color: "#6b7280" }} />
        </div>
        <div style={block}>
          <label style={label}>اسم المستخدم الجديد (اختياري)</label>
          <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder={username ?? ""} style={input} />
        </div>
        <div style={block}>
          <label style={label}>كلمة المرور الحالية</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={input} required />
        </div>
        <div style={block}>
          <label style={label}>كلمة المرور الجديدة (6 أحرف على الأقل)</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={input} required minLength={6} />
        </div>
        <button type="submit" disabled={saving} style={{ padding: "12px 20px", background: "#e85d04", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>
          {saving ? "جاري الحفظ..." : "تحديث الحساب"}
        </button>
      </form>
    </div>
  );
}

interface Settings {
  id: string;
  restaurantName: string;
  address?: string | null;
  mapUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  currency: string;
  logoUrl?: string | null;
  mode: string;
  isOpen: boolean;
  extraInfo?: string | null;
  messageFooter?: string | null;
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
        جاري التحميل...
      </div>
    );
  }

  return <SettingsForm settings={settings} onSaved={setSettings} />;
}

function SettingsForm({
  settings,
  onSaved,
}: {
  settings: Settings | null;
  onSaved: (s: Settings) => void;
}) {
  const [form, setForm] = useState({
    restaurantName: "",
    address: "",
    mapUrl: "",
    phone: "",
    whatsapp: "",
    facebookUrl: "",
    instagramUrl: "",
    currency: "IQD",
    logoUrl: "",
    mode: "dine-in",
    isOpen: true,
    extraInfo: "",
    messageFooter: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        restaurantName: settings.restaurantName ?? "",
        address: settings.address ?? "",
        mapUrl: settings.mapUrl ?? "",
        phone: settings.phone ?? "",
        whatsapp: settings.whatsapp ?? "",
        facebookUrl: settings.facebookUrl ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        currency: settings.currency ?? "IQD",
        logoUrl: settings.logoUrl ?? "",
        mode: settings.mode ?? "dine-in",
        isOpen: settings.isOpen ?? true,
        extraInfo: settings.extraInfo ?? "",
        messageFooter: settings.messageFooter ?? "",
      });
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setLogoUploading(false);
    if (res.ok) setForm((f) => ({ ...f, logoUrl: data.url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الحفظ");
        return;
      }
      onSaved(data);
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const block = { marginBottom: "20px" };
  const label = { display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "6px" };
  const input = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  };
  const section = { marginBottom: "24px" };
  const sectionTitle = { fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: "12px" };
  const card = { background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <div style={{ ...card, marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>إعدادات المتجر</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>معلومات المتجر والعنوان والاتصال</p>
      </div>

      <AdminAccountCard />

      {error && (
        <div style={{ ...card, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={card}>
          <div style={{ ...sectionTitle, ...section }}>معلومات أساسية</div>
          <div style={block}>
            <label style={label}>اسم المتجر</label>
            <input type="text" value={form.restaurantName} onChange={(e) => setForm((f) => ({ ...f, restaurantName: e.target.value }))} style={input} required />
          </div>
          <div style={block}>
            <label style={label}>العنوان</label>
            <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="IRAQ - MOSUL - ..." style={input} />
          </div>
          <div style={block}>
            <label style={label}>رابط خريطة غوغل</label>
            <input type="text" value={form.mapUrl} onChange={(e) => setForm((f) => ({ ...f, mapUrl: e.target.value }))} placeholder="https://maps.app.goo.gl/..." style={input} />
          </div>
        </div>

        <div style={card}>
          <div style={{ ...sectionTitle, ...section }}>الاتصال</div>
          <div style={block}>
            <label style={label}>رقم الهاتف</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXXX" style={input} />
          </div>
          <div style={block}>
            <label style={label}>رقم واتساب</label>
            <input type="tel" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="9647XX XXX XXXX" style={input} />
          </div>
          <div style={block}>
            <label style={label}>العملة</label>
            <input type="text" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} style={input} />
          </div>
        </div>

        <div style={card}>
          <div style={{ ...sectionTitle, ...section }}>شبكات التواصل</div>
          <div style={block}>
            <label style={label}>فيسبوك</label>
            <input type="text" value={form.facebookUrl} onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))} placeholder="https://facebook.com/..." style={input} />
          </div>
          <div style={block}>
            <label style={label}>انستغرام</label>
            <input type="text" value={form.instagramUrl} onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))} placeholder="https://instagram.com/..." style={input} />
          </div>
        </div>

        <div style={card}>
          <div style={{ ...sectionTitle, ...section }}>الشعار</div>
          <div style={block}>
            <input type="text" value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} placeholder="ارفع صورة أو الصق رابطاً" style={input} />
          </div>
          <label style={{ display: "block", width: "100%", padding: "12px", background: "#e85d04", color: "white", borderRadius: "12px", textAlign: "center", fontWeight: 600, cursor: "pointer" }}>
            {logoUploading ? "جاري الرفع..." : "رفع صورة"}
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} disabled={logoUploading} />
          </label>
        </div>

        <div style={card}>
          <div style={{ ...sectionTitle, ...section }}>إعدادات الطلب</div>
          <div style={block}>
            <label style={label}>وضع الطلب</label>
            <select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))} style={input}>
              <option value="dine-in">داخل المتجر (رقم الطاولة)</option>
              <option value="delivery">توصيل (العنوان)</option>
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm((f) => ({ ...f, isOpen: e.target.checked }))} style={{ width: "20px", height: "20px" }} />
            <span style={{ fontWeight: 500 }}>المتجر مفتوح</span>
          </label>
        </div>

        <div style={card}>
          <div style={{ ...sectionTitle, ...section }}>نصوص إضافية</div>
          <div style={block}>
            <label style={label}>نص وصفي</label>
            <textarea value={form.extraInfo} onChange={(e) => setForm((f) => ({ ...f, extraInfo: e.target.value }))} placeholder="خدمة ممتازة وتوصيل سريع..." rows={3} style={{ ...input, resize: "vertical" }} />
          </div>
          <div style={block}>
            <label style={label}>تذييل رسالة الطلب</label>
            <input type="text" value={form.messageFooter} onChange={(e) => setForm((f) => ({ ...f, messageFooter: e.target.value }))} placeholder="شكراً لزيارتكم" style={input} />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            padding: "14px",
            background: "#e85d04",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </form>
    </div>
  );
}
