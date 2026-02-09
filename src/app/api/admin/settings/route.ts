import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    let settings = await prisma.restaurantSettings.findFirst();
    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          restaurantName: "المتجر",
          currency: "IQD",
          mode: "dine-in",
          isOpen: true,
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
        { status: 400 }
      );
    }
    let settings = await prisma.restaurantSettings.findFirst();
    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: parsed.data,
      });
    } else {
      settings = await prisma.restaurantSettings.update({
        where: { id: settings.id },
        data: parsed.data,
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
