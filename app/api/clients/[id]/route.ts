import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id);
    
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        bills: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            billItems: true
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend format
    const formattedClient = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      totalPurchases: client.bills.length,
      totalSpent: client.bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
      lastPurchase: client.bills[0]?.createdAt.toLocaleDateString() || "No purchases",
      purchases: client.bills.map(bill => ({
        billId: `BIL${String(bill.id).padStart(3, '0')}`,
        date: bill.createdAt.toLocaleDateString(),
        items: bill.billItems.length,
        amount: bill.totalAmount,
        paymentMethod: bill.paymentMethod
      }))
    };

    return NextResponse.json(formattedClient);
  } catch (error) {
    console.error("Error fetching client details:", error);
    return NextResponse.json(
      { error: "Error fetching client details" },
      { status: 500 }
    );
  }
} 