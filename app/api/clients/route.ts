import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const prismaClient = new PrismaClient();

// GET all clients
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
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

    // Transform the data to match the frontend format
    const formattedClients = clients.map(client => {
      const totalPurchases = client.bills.length;
      const totalSpent = client.bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const lastPurchase = client.bills[0]?.createdAt || null;

      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        totalPurchases,
        totalSpent,
        lastPurchase: lastPurchase ? lastPurchase.toLocaleDateString() : "No purchases",
        purchases: client.bills.map(bill => ({
          billId: `BIL${String(bill.id).padStart(3, '0')}`,
          date: bill.createdAt.toLocaleDateString(),
          items: bill.billItems.length,
          amount: bill.totalAmount,
          paymentMethod: bill.paymentMethod
        }))
      };
    });

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Error fetching clients data" },
      { status: 500 }
    );
  }
}

// POST new client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address } = body;

    // Check if client with phone number already exists
    const existingClient = await prisma.client.findUnique({
      where: {
        phone: phone,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this phone number already exists" },
        { status: 400 }
      );
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        address,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Error creating client" },
      { status: 500 }
    );
  }
}
