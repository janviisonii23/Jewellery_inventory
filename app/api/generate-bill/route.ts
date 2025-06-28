import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);
    const { clientName, clientPhone, items, subtotal, tax, total, paymentMethod } = body;

    // Find the client by phone number
    const client = await prisma.client.findUnique({
      where: { phone: clientPhone }
    });
    console.log("Found client:", client);

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Get the latest bill number and generate new one
    const latestBill = await prisma.bill.findFirst({
      orderBy: { id: 'desc' }
    });
    console.log("Latest bill:", latestBill);

    const billNumber = latestBill ? 
      `BIL${String(parseInt(latestBill.id.toString()) + 1).padStart(3, '0')}` : 
      'BIL001';
    console.log("Generated bill number:", billNumber);

    // Create the bill
    const billData = {
      clientId: client.id,
      totalAmount: parseFloat(total),
      subtotal: parseFloat(subtotal),
      tax: parseFloat(tax),
      paymentMethod: paymentMethod,
    };
    console.log("Creating bill with data:", billData);

    const bill = await prisma.bill.create({
      data: billData
    });
    console.log("Created bill:", bill);

    // Verify bill was created
    const verifiedBill = await prisma.bill.findUnique({
      where: { id: bill.id },
      include: { billItems: true }
    });
    console.log("Verified bill with items:", verifiedBill);

    // Create bill items and update ornament status
    for (const item of items) {
      console.log("Processing item:", item);
      
      // Create bill item
      const billItemData = {
        billId: bill.id,
        ornamentId: item.ornamentId,
        sellingPrice: parseFloat(item.sellingPrice)
      };
      console.log("Creating bill item with data:", billItemData);

      const billItem = await prisma.billItem.create({
        data: billItemData
      });
      console.log("Created bill item:", billItem);

      // Verify bill item was created
      const verifiedBillItem = await prisma.billItem.findUnique({
        where: { id: billItem.id }
      });
      console.log("Verified bill item:", verifiedBillItem);

      // Update ornament status to sold
      const ornamentUpdateData = {
        isSold: true,
        soldAt: new Date(),
        soldPrice: parseFloat(item.sellingPrice)
      };
      console.log("Updating ornament with data:", ornamentUpdateData);

      const updatedOrnament = await prisma.ornament.update({
        where: { ornamentId: item.ornamentId },
        data: ornamentUpdateData
      });
      console.log("Updated ornament:", updatedOrnament);
    }

    // Final verification of all bill items
    const finalBillItems = await prisma.billItem.findMany({
      where: { billId: bill.id }
    });
    console.log("Final bill items count:", finalBillItems.length);
    console.log("Final bill items:", finalBillItems);

    return NextResponse.json({
      success: true,
      billNumber: billNumber,
      billId: bill.id,
      itemsCount: finalBillItems.length
    });

  } catch (error) {
    console.error("Detailed error in generate-bill:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error generating bill" },
      { status: 500 }
    );
  }
}