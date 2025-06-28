"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Merchant {
  merchantCode: string;
  name: string;
  phone: string;
  createdAt: string;
  totalOrnaments: number;
  inStock: number;
  sold: number;
  totalValue: number;
  ornaments: {
    ornamentId: string;
    type: string;
    weight: number;
    purity: string;
    costPrice: number;
    isSold: boolean;
  }[];
}

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantCode = params.merchantCode as string;
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMerchantDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/merchants/${merchantCode}`);
        if (!response.ok) throw new Error("Failed to load merchant details");
        const data = await response.json();
        setMerchant(data);
      } catch (error) {
        console.error("Failed to load merchant details:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMerchantDetails();
  }, [merchantCode]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading merchant details...</p></div>;
  }

  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Merchant not found</p>
        <Button asChild>
          <Link href="/merchants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchants
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href="/merchants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Merchant Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="text-lg font-medium">{merchant.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Merchant Code</dt>
                <dd>{merchant.merchantCode}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd>{merchant.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Registered Since</dt>
                <dd>{merchant.createdAt.split('T')[0]}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ornament Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Total Ornaments</dt>
                <dd className="text-lg font-medium">{merchant.totalOrnaments}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">In Stock</dt>
                <dd>{merchant.inStock}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Sold</dt>
                <dd>{merchant.sold}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Value</dt>
                <dd className="text-lg font-medium">₹{merchant.totalValue.toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" asChild>
              <Link href={`/inventory/add?merchant=${merchant.merchantCode}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Products
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ornament Inventory</CardTitle>
          <CardDescription>All ornaments provided by this merchant</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ornament ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight (g)</TableHead>
                <TableHead>Purity</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchant.ornaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No ornaments found for this merchant.
                  </TableCell>
                </TableRow>
              ) : (
                merchant.ornaments.map((o) => (
                  <TableRow key={o.ornamentId}>
                    <TableCell className="font-medium">{o.ornamentId}</TableCell>
                    <TableCell>{o.type}</TableCell>
                    <TableCell>{o.weight}g</TableCell>
                    <TableCell>{o.purity}</TableCell>
                    <TableCell>₹{o.costPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={o.isSold ? "destructive" : "default"}>
                        {o.isSold ? "Sold" : "In Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 