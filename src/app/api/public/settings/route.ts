import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
