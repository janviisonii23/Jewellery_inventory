import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(
  request: Request,
  { params }: { params: { billId: string } }
) {
  try {
    // Ensure params.billId is properly parsed
    const billId = Number(params.billId);
    if (isNaN(billId)) {
      return NextResponse.json(
        { error: "Invalid bill ID" },
        { status: 400 }
      );
    }

    // Fetch bill details with client and items
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

    // Create PDF with font configuration
    const doc = new PDFDocument({
      font: 'Helvetica',
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    const chunks: Buffer[] = [];

    // Handle document chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Add content to PDF
    doc.fontSize(20).text('Jewellery Store Bill', { align: 'center' });
    doc.moveDown();
    
    // Bill details
    doc.fontSize(12).text(`Bill Number: BIL${String(bill.id).padStart(3, '0')}`);
    doc.text(`Date: ${bill.createdAt.toLocaleDateString()}`);
    doc.text(`Client Name: ${bill.client.name}`);
    doc.text(`Phone: ${bill.client.phone}`);
    if (bill.client.email) doc.text(`Email: ${bill.client.email}`);
    if (bill.client.address) doc.text(`Address: ${bill.client.address}`);
    doc.moveDown();

    // Items table
    doc.text('Items:', { underline: true });
    doc.moveDown();
    
    // Table header
    const startX = 50;
    doc.text('Item ID', startX, doc.y, { width: 100 });
    doc.text('Type', startX + 100, doc.y - doc.currentLineHeight(), { width: 100 });
    doc.text('Weight', startX + 200, doc.y - doc.currentLineHeight(), { width: 100 });
    doc.text('Price', startX + 300, doc.y - doc.currentLineHeight(), { width: 100 });
    doc.moveDown();

    // Table rows
    bill.billItems.forEach((item) => {
      const y = doc.y;
      doc.text(item.ornamentId, startX, y, { width: 100 });
      doc.text(item.ornament.type, startX + 100, y, { width: 100 });
      doc.text(`${item.ornament.weight}g`, startX + 200, y, { width: 100 });
      doc.text(`₹${item.sellingPrice.toLocaleString()}`, startX + 300, y, { width: 100 });
      doc.moveDown();
    });

    // Totals
    doc.moveDown();
    doc.text(`Subtotal: ₹${bill.subtotal.toLocaleString()}`, { align: 'right' });
    doc.text(`Tax (3%): ₹${bill.tax.toLocaleString()}`, { align: 'right' });
    doc.text(`Total: ₹${bill.totalAmount.toLocaleString()}`, { align: 'right' });
    doc.moveDown();
    doc.text(`Payment Method: ${bill.paymentMethod.toUpperCase()}`, { align: 'right' });

    // Add footer
    doc.fontSize(10)
       .text(
         'Thank you for your business!',
         50,
         doc.page.height - 50,
         { align: 'center' }
       );

    // Finalize PDF
    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        // Convert chunks to buffer
        const pdfBuffer = Buffer.concat(chunks);

        // Return PDF with proper headers
        resolve(new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="bill-${bill.id}.pdf"`,
            'Content-Length': pdfBuffer.length.toString()
          }
        }));
      });
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF" },
      { status: 500 }
    );
  }
} 