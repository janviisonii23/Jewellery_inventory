"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Download, Filter, Search, Eye } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { BillDetailsCard } from "@/components/bill-details-card"

interface Sale {
  billId: string
  date: string
  clientName: string
  clientPhone: string
  items: number
  total: number
  paymentMethod: string
  billItems: {
    ornamentId: string
    type: string
    weight: number
    purity: string
    sellingPrice: number
  }[]
}

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [salesData, setSalesData] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<Sale | null>(null)
  const [showBillDetails, setShowBillDetails] = useState(false)

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/sales")
        if (!response.ok) {
          throw new Error("Failed to fetch sales data")
        }
        const data = await response.json()
        setSalesData(data)
      } catch (error) {
        console.error("Error loading sales data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSalesData()
  }, [])

  // Filter sales data based on search term and filters
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch = searchTerm
      ? sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.clientPhone.includes(searchTerm) ||
        sale.billId.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesDate = date
      ? sale.date === format(date, "MM/dd/yyyy")
      : true

    const matchesPayment = paymentFilter === "all" || sale.paymentMethod === paymentFilter

    return matchesSearch && matchesDate && matchesPayment
  })

  // Calculate total sales
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)

  // Calculate total items sold
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bills Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search sales history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by client or bill ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <span>
                    {paymentFilter === "all"
                      ? "All Payment Methods"
                      : paymentFilter.charAt(0).toUpperCase() + paymentFilter.slice(1)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>{loading ? "Loading..." : `Showing ${filteredSales.length} records`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
                <TableHead className="w-[50px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    Loading sales data...
                  </TableCell>
                </TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No sales records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.billId}>
                    <TableCell className="font-medium">{sale.billId}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.clientName}</p>
                        <p className="text-sm text-muted-foreground">{sale.clientPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{sale.items}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sale.paymentMethod.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{sale.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedBill(sale)
                          setShowBillDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bill Details Card */}
      {selectedBill && (
        <BillDetailsCard
          isOpen={showBillDetails}
          onClose={() => {
            setShowBillDetails(false)
            setSelectedBill(null)
          }}
          billItems={selectedBill.billItems}
          billNumber={selectedBill.billId}
          totalAmount={selectedBill.total}
        />
      )}
    </div>
  )
}
