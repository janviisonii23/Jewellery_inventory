"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface PDFViewerProps {
  billId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFViewer({ billId, isOpen, onClose }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [billData, setBillData] = useState<any>(null);
  const { toast } = useToast();

  // Fetch bill data when dialog opens
  const fetchBillData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bills/${billId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bill data');
      }
      const data = await response.json();
      setBillData(data);
    } catch (error) {
      console.error('Error fetching bill:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bill details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when dialog opens
  useState(() => {
    if (isOpen && billId) {
      fetchBillData();
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (!billData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <div className="print:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Jewellery Store Bill</h1>
            <p className="text-sm text-muted-foreground">Bill #{String(billData.id).padStart(3, '0')}</p>
          </div>

          {/* Client Details */}
          <Card className="mb-6">
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
              <div>
                <p className="font-semibold">Client Details:</p>
                <p>{billData.client.name}</p>
                <p>{billData.client.phone}</p>
                {billData.client.email && <p>{billData.client.email}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold">Bill Details:</p>
                <p>Date: {new Date(billData.createdAt).toLocaleDateString()}</p>
                <p>Payment: {billData.paymentMethod.toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <div className="mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billData.billItems.map((item: any) => (
                  <TableRow key={item.ornamentId}>
                    <TableCell>{item.ornamentId}</TableCell>
                    <TableCell>{item.ornament.type}</TableCell>
                    <TableCell>{item.ornament.weight}g</TableCell>
                    <TableCell className="text-right">₹{item.sellingPrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end space-y-2 mb-8">
            <p>Subtotal: ₹{billData.subtotal.toLocaleString()}</p>
            <p>Tax (3%): ₹{billData.tax.toLocaleString()}</p>
            <p className="font-bold">Total: ₹{billData.totalAmount.toLocaleString()}</p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 