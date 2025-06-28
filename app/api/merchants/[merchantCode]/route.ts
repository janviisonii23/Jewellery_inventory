import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { merchantCode: string } }
) {
  try {
    const merchantCode = params.merchantCode;
    
    const merchant = await prisma.merchant.findUnique({
      where: { merchantCode },
      include: {
        ornaments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    // Calculate summary fields
    const totalOrnaments = merchant.ornaments.length;
    const inStock = merchant.ornaments.filter(o => !o.isSold).length;
    const sold = merchant.ornaments.filter(o => o.isSold).length;
    const totalValue = merchant.ornaments.reduce((sum, o) => sum + o.costPrice, 0);

    // Transform the data to match the frontend format
    const formattedMerchant = {
      merchantCode: merchant.merchantCode,
      name: merchant.name,
      phone: merchant.phone,
      createdAt: merchant.createdAt,
      totalOrnaments,
      inStock,
      sold,
      totalValue,
      ornaments: merchant.ornaments.map(o => ({
        ornamentId: o.ornamentId,
        type: o.type,
        weight: o.weight,
        purity: o.purity,
        costPrice: o.costPrice,
        isSold: o.isSold,
      })),
    };

    return NextResponse.json(formattedMerchant);
  } catch (error) {
    console.error("Error fetching merchant details:", error);
    return NextResponse.json(
      { error: "Error fetching merchant details" },
      { status: 500 }
    );
  }
} 