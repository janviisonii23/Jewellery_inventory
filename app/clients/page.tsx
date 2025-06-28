"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { fetchClients, addClient } from "@/lib/api"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string;
  purchases: {
    billId: string;
    date: string;
    items: number;
    amount: number;
    paymentMethod: string;
  }[];
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" })
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/clients")
        if (!response.ok) {
          throw new Error("Failed to fetch clients")
        }
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Handle adding a new client
  const handleAddClient = async () => {
    try {
      if (!newClient.name || !newClient.phone) {
        toast({
          title: "Missing information",
          description: "Name and phone number are required",
          variant: "destructive",
        })
        return
      }

      const response = await addClient(newClient)

      if (response.success) {
        toast({
          title: "Client added",
          description: "The client has been added successfully",
        })

        // Add the new client to the list
        setClients([
          ...clients,
          {
            id: response.clientId,
            ...newClient,
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchase: "-",
            purchases: [],
          },
        ])

        // Reset form and close dialog
        setNewClient({ name: "", phone: "", email: "" })
        setShowAddClientDialog(false)
      } else {
        toast({
          title: "Error adding client",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        title: "Error adding client",
        description: "There was a problem adding the client. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Button onClick={() => setShowAddClientDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search Clients</CardTitle>
          <CardDescription>Find clients by name, phone, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>{loading ? "Loading..." : `Showing ${filteredClients.length} clients`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading clients...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{client.phone}</p>
                        {client.email && (
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{client.totalPurchases}</TableCell>
                    <TableCell>₹{client.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>{client.lastPurchase}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/clients/${client.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>Enter client details to add them to your system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="client-name">Name *</Label>
              <Input
                id="client-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Enter client name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Phone Number *</Label>
              <Input
                id="client-phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email (Optional)</Label>
              <Input
                id="client-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
