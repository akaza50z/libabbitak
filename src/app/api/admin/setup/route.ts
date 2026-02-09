import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { adminExists } from "@/lib/auth";
import { setupSchema } from "@/lib/validations";

export async function GET() {
  const exists = await adminExists();
  return NextResponse.json({ setupRequired: !exists });
}

export async function POST(request: NextRequest) {
  try {
    const exists = await adminExists();
    if (exists) {
      return NextResponse.json(
        { error: "الإعداد مكتمل مسبقاً" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.adminUser.create({
      data: {
        username: parsed.data.username,
        passwordHash,
      },
    });
    await createSession(parsed.data.username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to setup admin" },
      { status: 500 }
    );
  }
}
