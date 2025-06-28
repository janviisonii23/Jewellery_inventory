import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: {
    billId: string;
  };
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    // Safely parse the billId
    const billId = parseInt(params.billId, 10);
    
    if (isNaN(billId)) {
      return NextResponse.json(
        { error: "Invalid bill ID" },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        client: true,
        billItems: {
          include: {
            ornament: true
          }
        }
      }
    });

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill data" },
      { status: 500 }
    );
  }
} 