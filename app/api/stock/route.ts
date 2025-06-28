import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const merchant = searchParams.get('merchant');
    const purity = searchParams.get('purity');
    const search = searchParams.get('search');

    const ornaments = await prisma.ornament.findMany({
      where: {
        AND: [
          type ? { type } : {},
          status ? { isSold: status === 'sold' } : {},
          merchant ? { merchantCode: merchant } : {},
          purity ? { purity } : {},
          search ? {
            OR: [
              { ornamentId: { contains: search } },
              { merchantCode: { contains: search } }
            ]
          } : {}
        ]
      },
      include: {
        merchant: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedData = ornaments.map(ornament => ({
      id: ornament.id,
      ornamentId: ornament.ornamentId,
      type: ornament.type,
      weight: ornament.weight,
      costPrice: ornament.costPrice,
      merchant: ornament.merchantCode,
      merchantName: ornament.merchant.name,
      status: ornament.isSold ? 'sold' : 'in_stock',
      purity: ornament.purity,
      addedDate: ornament.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
} 