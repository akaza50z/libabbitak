"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((data) => {
        if (!data.setupRequired) {
          router.replace("/admin/login");
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الإعداد");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center" dir="rtl">
        <p className="text-gray-500">جاري التحقق...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4" dir="rtl">
      <div
        className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-orange-100"
        style={{
          background: "linear-gradient(180deg, #fff 0%, #fffbf7 100%)",
        }}
      >
        <div
          className="px-6 py-8 text-white"
          style={{
            background: "linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
          }}
        >
          <h1 className="text-xl font-bold text-center">إعداد الحساب</h1>
          <p className="text-white/90 text-sm text-center mt-1">إنشاء حساب المسؤول (مرة واحدة فقط)</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#e85d04] focus:ring-2 focus:ring-[#e85d04]/20 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور (6 أحرف على الأقل)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#e85d04] focus:ring-2 focus:ring-[#e85d04]/20 outline-none"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#e85d04] focus:ring-2 focus:ring-[#e85d04]/20 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#e85d04] text-white font-bold rounded-xl hover:bg-[#d14d04] disabled:opacity-60 transition-all"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
      </div>
    </div>
  );
}
