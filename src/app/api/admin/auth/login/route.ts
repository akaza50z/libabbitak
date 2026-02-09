import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const ok = await login(parsed.data.username, parsed.data.password);
    if (!ok) {
      return NextResponse.json(
        { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "خطأ في تسجيل الدخول" },
      { status: 500 }
    );
  }
}
