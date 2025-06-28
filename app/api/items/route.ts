import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OrnamentItem {
  id: string;
  ornamentId: string;
  type: string;
  weight: number;
  purity: string;
  costPrice: number;
  createdAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Type parameter is required" },
        { status: 400 }
      );
    }

    const items = await prisma.ornament.findMany({
      where: {
        type: type.toLowerCase(),
        soldAt: null, // Only get unsold items
      },
      select: {
        id: true,
        ornamentId: true,
        type: true,
        weight: true,
        purity: true,
        costPrice: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate selling price (3% markup)
    const itemsWithPrice = items.map((item: OrnamentItem) => ({
      ...item,
      sellingPrice: Math.round(item.costPrice * 1.03),
    }));

    return NextResponse.json({
      success: true,
      items: itemsWithPrice,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
} 