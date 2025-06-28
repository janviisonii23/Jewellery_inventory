import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Merchant, Ornament } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    console.log('API: Fetching merchants with search term:', searchTerm);

    const merchants = await prisma.merchant.findMany({
      where: searchTerm ? {
        OR: [
          { name: { contains: searchTerm } },
          { merchantCode: { contains: searchTerm } },
          { phone: { contains: searchTerm } }
        ]
      } : undefined,
      include: {
        ornaments: true // Include ornaments to calculate totals
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Transform merchants to include calculated totals
    const transformedMerchants = merchants.map((merchant: Merchant & { ornaments: Ornament[] }) => {
      const totalOrnaments = merchant.ornaments.length;
      const totalValue = merchant.ornaments
        .filter(o => !o.isSold)
        .reduce((sum, o) => sum + o.costPrice, 0);

      return {
        name: merchant.name,
        merchantCode: merchant.merchantCode,
        phone: merchant.phone,
        createdAt: merchant.createdAt,
        totalOrnaments,
        totalValue
      };
    });
    
    console.log('API: Transformed merchants:', transformedMerchants);
    return NextResponse.json(transformedMerchants);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, merchantCode, phone } = body;
    console.log('API: Adding new merchant:', { name, merchantCode, phone });

    // Validate required fields
    if (!name || !merchantCode || !phone) {
      return NextResponse.json(
        { error: "Name, merchant code, and phone are required" },
        { status: 400 }
      );
    }

    // Create new merchant using Prisma
    const merchant = await prisma.merchant.create({
      data: {
        merchantCode,
        name,
        phone,
      },
    });

    console.log('API: Created merchant:', merchant);
    return NextResponse.json({ merchant });
  } catch (error: any) {
    console.error("Error adding merchant:", error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Merchant code or phone number already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add merchant" },
      { status: 500 }
    );
  }
} 