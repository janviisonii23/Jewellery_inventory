"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BillDetailsCardProps {
  isOpen: boolean;
  onClose: () => void;
  billItems: {
    ornamentId: string;
    type: string;
    weight: number;
    purity: string;
    sellingPrice: number;
  }[];
  billNumber: string;
  totalAmount: number;
}

export function BillDetailsCard({ isOpen, onClose, billItems, billNumber, totalAmount }: BillDetailsCardProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Bill Details - {billNumber}</h2>
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Purity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billItems.map((item) => (
                  <TableRow key={item.ornamentId}>
                    <TableCell className="font-medium">{item.ornamentId}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.weight}g</TableCell>
                    <TableCell>{item.purity}</TableCell>
                    <TableCell className="text-right">₹{item.sellingPrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total: ₹{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 