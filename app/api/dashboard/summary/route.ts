import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Bill, BillItem, Client, Merchant, Ornament } from "@prisma/client";

interface BillWithRelations extends Bill {
  client: Client;
  billItems: (BillItem & {
    ornament: Ornament;
  })[];
}

interface MerchantWithSoldOrnaments extends Merchant {
  ornaments: {
    soldPrice: number | null;
  }[];
}

export async function GET() {
  try {
    // Get total revenue and sales count
    const salesData = await prisma.bill.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });

    // Get total inventory value and count
    const inventoryData = await prisma.ornament.aggregate({
      _sum: {
        costPrice: true,
      },
      _count: true,
      where: {
        isSold: false,
      },
    });

    // Get recent sales
    const recentSales = await prisma.bill.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: true,
        billItems: {
          include: {
            ornament: true,
          },
        },
      },
    }) as BillWithRelations[];

    // Get top merchants
    const topMerchants = await prisma.merchant.findMany({
      take: 5,
      include: {
        ornaments: {
          where: {
            isSold: true,
          },
          select: {
            soldPrice: true,
          },
        },
      },
    }) as MerchantWithSoldOrnaments[];

    // Get inventory summary by type
    const inventorySummary = await prisma.ornament.groupBy({
      by: ['type'],
      _count: true,
      _sum: {
        costPrice: true,
      },
      where: {
        isSold: false,
      },
    });

    return NextResponse.json({
      revenue: {
        total: salesData._sum.totalAmount || 0,
        salesCount: salesData._count || 0,
      },
      inventory: {
        totalValue: inventoryData._sum.costPrice || 0,
        itemsInStock: inventoryData._count || 0,
      },
      recentSales: recentSales.map((bill: BillWithRelations) => ({
        id: bill.id,
        amount: bill.totalAmount,
        date: bill.createdAt,
        client: bill.client.name,
        items: bill.billItems.length,
      })),
      topMerchants: topMerchants.map((merchant: MerchantWithSoldOrnaments) => ({
        id: merchant.merchantCode,
        name: merchant.name,
        totalSales: merchant.ornaments.length,
        revenue: merchant.ornaments.reduce((acc: number, ornament) => acc + (ornament.soldPrice || 0), 0),
      })),
      inventorySummary: inventorySummary.map((type) => ({
        category: type.type,
        count: type._count,
        value: type._sum.costPrice || 0,
      })),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
} 