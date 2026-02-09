"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<{ restaurantName?: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const navItems = [
    { href: "/admin", label: "الإعدادات", icon: "⚙️" },
    { href: "/admin/categories", label: "الفئات", icon: "📁" },
    { href: "/admin/items", label: "الأصناف", icon: "📦" },
  ];

  return (
    <div
      className="admin-mobile-root"
      dir="rtl"
      role="application"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        background: "#f5f0e8",
      }}
    >
      {/* Compact top bar */}
      <header
        style={{
          flexShrink: 0,
          background: "linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <h1
          style={{
            fontSize: "15px",
            fontWeight: 700,
            margin: 0,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {settings?.restaurantName ?? "لوحة الإدارة"}
        </h1>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <Link
            href="/ar"
            target="_blank"
            style={{
              padding: "8px 12px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "white",
              textDecoration: "none",
            }}
          >
            القائمة
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            خروج
          </button>
        </div>
      </header>

      {/* Main content - scrollable */}
      <main
        style={{
          flex: 1,
          overflowX: "hidden",
          overflowY: "auto",
          padding: "16px",
          paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {/* Bottom tab bar - mobile nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "white",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-around",
          paddingBottom: "env(safe-area-inset-bottom)",
          zIndex: 50,
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 8px",
                color: isActive ? "#e85d04" : "#6b7280",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <span style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
