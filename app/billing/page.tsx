"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QrCode, Trash2, UserPlus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { QrScanner } from "@/components/qr-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFViewer } from "@/components/pdf-viewer"

const ORNAMENT_TYPES = [
  { value: "ring", label: "Ring" },
  { value: "necklace", label: "Necklace" },
  { value: "bracelet", label: "Bracelet" },
  { value: "earring", label: "Earring" },
  { value: "pendant", label: "Pendant" },
]

interface ScanItemResponse {
  success: boolean;
  item?: {
    ornamentId: string;
    type: string;
    weight: number;
    purity: string;
    sellingPrice: number;
  };
  error?: string;
}

interface GenerateBillResponse {
  success: boolean;
  billNumber?: number;
  billId?: string;
  error?: string;
}

// Mock function to simulate API call for scanning QR code
async function mockScanQrCode(qrData: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock response
  return {
    success: true,
    item: {
      ornamentId: qrData || "R001",
      type: "ring",
      weight: 8.5,
      purity: "22K",
      sellingPrice: 45000,
    },
  }
}

// Mock function to simulate API call for fetching items by type
async function mockFetchItemsByType(type: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock response
  return {
    success: true,
    items: [
      {
        ornamentId: `${type.charAt(0).toUpperCase()}001`,
        type: type,
        weight: 8.5,
        purity: "22K",
        costPrice: 42500,
        sellingPrice: 45000,
      },
      {
        ornamentId: `${type.charAt(0).toUpperCase()}002`,
        type: type,
        weight: 12.3,
        purity: "24K",
        costPrice: 65000,
        sellingPrice: 68000,
      },
    ],
  }
}

export default function BillingPage() {
  const [client, setClient] = useState({ id: 0, name: "", phone: "", address: "", email: "" })
  const [scannedItems, setScannedItems] = useState<any[]>([])
  const [qrInput, setQrInput] = useState("")
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showTypeSelect, setShowTypeSelect] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [typeItems, setTypeItems] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("qr")
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [currentBillId, setCurrentBillId] = useState<number | null>(null)

  // Function to handle QR code scanning
  const handleScanQR = async (qrData: string) => {
    if (!qrData?.trim()) return

    setIsScanning(true)
    try {
      const response = await fetch("/api/scan-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });
      
      const data: ScanItemResponse = await response.json();

      if (data.success && data.item) {
        // Check if item is already in the cart
        if (scannedItems.some((item) => item.ornamentId === data.item!.ornamentId)) {
          toast({
            title: "Item already added",
            description: "This item is already in your cart",
            variant: "destructive",
          });
          return;
        }

        setScannedItems([...scannedItems, data.item]);
        setQrInput("");
        setShowScanner(false);
        toast({
          title: "Item added",
          description: `${data.item.type} (${data.item.ornamentId}) added to cart`,
        });
      } else {
        toast({
          title: "Invalid QR code",
          description: data.error || "Could not find item with this code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scanning QR code:", error)
      toast({
        title: "Error scanning QR code",
        description: "There was a problem scanning the QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Function to handle type selection and fetch items
  const handleTypeSelect = async (type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/items?type=${type}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.success && data.items) {
        setTypeItems(data.items);
        setShowTypeSelect(true);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch items of selected type",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle item selection
  const handleItemSelect = (ornamentId: string) => {
    const selectedItem = typeItems.find((item) => item.ornamentId === ornamentId);
    if (selectedItem) {
      // Check if item is already in cart
      if (scannedItems.some((item) => item.ornamentId === ornamentId)) {
        toast({
          title: "Item already added",
          description: "This item is already in your cart",
          variant: "destructive",
        });
        return;
      }

      setScannedItems([
        ...scannedItems,
        { ...selectedItem, sellingPrice: "" } // Set price blank for user input
      ]);
      toast({
        title: "Item added",
        description: `${selectedItem.type} (${selectedItem.ornamentId}) added to cart`,
      });
    }
  };

  // Function to remove an item from the bill
  const removeItem = (ornamentId: string) => {
    setScannedItems(scannedItems.filter((item) => item.ornamentId !== ornamentId))
  }

  // Calculate subtotal
  const calculateSubtotal = () => {
    return scannedItems.reduce((total, item) => {
      const price = parseFloat(item.sellingPrice);
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  }

  // Calculate tax (3%)
  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.03)
  }

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  // Handle completing the sale
  const completeSale = async () => {
    if (!client.name || !client.phone) {
      setShowClientDialog(true);
      return;
    }

    if (scannedItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please scan at least one item before completing the sale.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/generate-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: client.name,
          clientPhone: client.phone,
          items: scannedItems.map((item) => ({
            ornamentId: item.ornamentId,
            sellingPrice: item.sellingPrice,
          })),
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          total: calculateTotal(),
          paymentMethod: paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success && data.billNumber && data.billId) {
        toast({
          title: "Sale completed",
          description: `Bill #${data.billNumber} generated successfully`,
        });

        // Show PDF viewer
        setCurrentBillId(data.billId);
        setShowPdfViewer(true);

        // Reset the form
        setScannedItems([]);
        setClient({ id: 0, name: "", phone: "", address: "", email: "" });
        setPaymentMethod("cash");
      } else {
        toast({
          title: "Error completing sale",
          description: data.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      toast({
        title: "Error completing sale",
        description: "There was a problem completing the sale. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update the item price input to be controlled
  const handleItemPriceChange = (idx: number, value: string) => {
    setScannedItems(items =>
      items.map((it, i) =>
        i === idx ? { ...it, sellingPrice: value } : it
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Billing</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Items</CardTitle>
              <CardDescription>Add items to the bill using QR code or select from inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                  <TabsTrigger value="select">Select Items</TabsTrigger>
                </TabsList>

                <TabsContent value="qr" className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="qr-input">QR Code / Item ID</Label>
                      <Input
                        id="qr-input"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        placeholder="Scan QR code or enter item ID"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={() => handleScanQR(qrInput)}
                      disabled={isScanning || !qrInput.trim()}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScanner(true)}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <QrCode className="mr-2 h-4 w-4" />
                          Scan QR
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="select" className="space-y-4">
                  <div>
                    <Label>Select Item Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) => {
                        setSelectedType(value);
                        handleTypeSelect(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORNAMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}

                  {showTypeSelect && typeItems.length > 0 && !isLoading && (
                    <div>
                      <Label>Select Item</Label>
                      <Select onValueChange={handleItemSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeItems.map((item) => (
                            <SelectItem key={item.ornamentId} value={item.ornamentId}>
                              {item.ornamentId} - {item.weight}g ({item.purity}) - ₹{item.sellingPrice.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showTypeSelect && typeItems.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No items found for this type
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="border rounded-md mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Weight (g)</TableHead>
                      <TableHead>Purity</TableHead>
                      <TableHead className="text-right">Price (₹)</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scannedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          No items added yet. Scan QR codes to add items.
                        </TableCell>
                      </TableRow>
                    ) : (
                      scannedItems.map((item, idx) => (
                        <TableRow key={item.ornamentId}>
                          <TableCell className="font-medium">{item.ornamentId}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.weight}g</TableCell>
                          <TableCell>{item.purity}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Enter price"
                              value={item.sellingPrice || ""}
                              onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.ornamentId)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
              <CardDescription>Client and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Client</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setShowClientDialog(true)}
                    >
                      <UserPlus className="mr-1 h-3 w-3" />
                      {client.name ? "Change" : "Add"}
                    </Button>
                  </div>
                  {client.name ? (
                    <div className="mt-1 text-sm">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-muted-foreground">{client.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No client selected</p>
                  )}
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Tax (3%)</span>
                    <span>₹{calculateTax().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4">
                    <span>Total</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={completeSale} disabled={scannedItems.length === 0}>
                Complete Sale
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>Add client information for this sale</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="client-name">Name</Label>
              <Input
                id="client-name"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                placeholder="Enter client name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Phone Number</Label>
              <Input
                id="client-phone"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={client.email || ""}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client-address">Address</Label>
              <Input
                id="client-address"
                value={client.address}
                onChange={(e) => setClient({ ...client, address: e.target.value })}
                placeholder="Enter address"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              try {
                if (!client.name || !client.phone) {
                  toast({
                    title: "Missing information",
                    description: "Please enter client name and phone number",
                    variant: "destructive",
                  });
                  return;
                }

                const response = await fetch("/api/clients", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(client),
                });

                const data = await response.json();

                if (response.ok) {
                  setClient({ ...client, id: data.id });
                  setShowClientDialog(false);
                  toast({
                    title: "Success",
                    description: "Client information saved successfully",
                  });
                } else {
                  toast({
                    title: "Error",
                    description: data.error || "Failed to save client information",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error("Error saving client:", error);
                toast({
                  title: "Error",
                  description: "Failed to save client information",
                  variant: "destructive",
                });
              }
            }}>Save Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={(open) => {
        setShowScanner(open);
        // Reset scanning state when dialog is closed
        if (!open) {
          setIsScanning(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Position the QR code within the frame to scan automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <QrScanner onScan={(qrData) => {
              setIsScanning(true);
              handleScanQR(qrData);
              // Close dialog after successful scan
              setTimeout(() => {
                setShowScanner(false);
                setIsScanning(false);
              }, 1000);
            }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add PDF Viewer */}
      {currentBillId && (
        <PDFViewer
          billId={currentBillId}
          isOpen={showPdfViewer}
          onClose={() => {
            setShowPdfViewer(false);
            setCurrentBillId(null);
          }}
        />
      )}
    </div>
  )
}
