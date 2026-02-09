import { redirect } from "next/navigation";
import { adminExists, isAuthenticated } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const exists = await adminExists();
  if (!exists) {
    redirect("/admin/setup");
  }
  const auth = await isAuthenticated();
  if (!auth) {
    redirect("/admin/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
