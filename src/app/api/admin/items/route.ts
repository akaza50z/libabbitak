import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { itemSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const items = await prisma.item.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: { select: { name_ar: true, id: true } } },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const body = await request.json();
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    const maxOrder = await prisma.item.aggregate({
      where: { categoryId: parsed.data.categoryId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const item = await prisma.item.create({
      data: { ...parsed.data, sortOrder },
      include: { category: { select: { name_ar: true, id: true } } },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
