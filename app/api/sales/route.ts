import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const sales = await prisma.bill.findMany({
      include: {
        client: true,
        billItems: {
          include: {
            ornament: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the frontend format
    const formattedSales = sales.map(bill => ({
      billId: `BIL${String(bill.id).padStart(3, '0')}`,
      date: bill.createdAt.toLocaleDateString(),
      clientName: bill.client.name,
      clientPhone: bill.client.phone,
      items: bill.billItems.length,
      total: bill.totalAmount,
      paymentMethod: bill.paymentMethod,
      billItems: bill.billItems.map(item => ({
        ornamentId: item.ornamentId,
        type: item.ornament.type,
        weight: item.ornament.weight,
        purity: item.ornament.purity,
        sellingPrice: item.sellingPrice
      }))
    }));

    return NextResponse.json(formattedSales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Error fetching sales data" },
      { status: 500 }
    );
  }
}