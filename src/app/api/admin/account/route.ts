import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  const user = await prisma.adminUser.findFirst({ select: { username: true } });
  if (!user) return NextResponse.json({ username: null }, { status: 404 });
  return NextResponse.json({ username: user.username });
}

const schema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة 6 أحرف على الأقل"),
  newUsername: z.string().min(1).optional(),
});

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const user = await prisma.adminUser.findFirst();
    if (!user) {
      return NextResponse.json({ error: "لم يتم العثور على المستخدم" }, { status: 404 });
    }
    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    }
    const passwordHash = await hashPassword(parsed.data.newPassword);
    const updateData: { passwordHash: string; username?: string } = { passwordHash };
    if (parsed.data.newUsername && parsed.data.newUsername !== user.username) {
      const taken = await prisma.adminUser.findUnique({ where: { username: parsed.data.newUsername } });
      if (taken) {
        return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
      }
      updateData.username = parsed.data.newUsername;
    }
    await prisma.adminUser.update({
      where: { id: user.id },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}
