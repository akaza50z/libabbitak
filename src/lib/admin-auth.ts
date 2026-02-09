import { NextResponse } from "next/server";
import { isAuthenticated } from "./auth";

export async function requireAdmin() {
  const ok = await isAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return null;
}
