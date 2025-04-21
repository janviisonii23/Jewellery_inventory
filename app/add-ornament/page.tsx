"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { QrCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { addOrnament } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

const formSchema = z.object({
  type: z.string({
    required_error: "Please select an ornament type.",
  }),
  weight: z.coerce.number().positive({
    message: "Weight must be a positive number.",
  }),
  costPrice: z.coerce.number().positive({
    message: "Cost price must be a positive number.",
  }),
  merchantCode: z.string().min(2, {
    message: "Merchant code must be at least 2 characters.",
  }),
  purity: z.string({
    required_error: "Please select purity.",
  }),
});
export type OrnamentFormData = z.infer<typeof formSchema>;

export default function AddOrnamentPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      weight: undefined,
      costPrice: undefined,
      merchantCode: "",
      purity: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await addOrnament(values);
      const qrData = JSON.stringify({
        ornamentId: response.ornamentId,
        type: values.type,
        merchantCode: values.merchantCode,
        weight: values.weight,
        purity: values.purity,
      });
      if (response.success) {
        toast({
          title: "✅ Ornament added",
          description: `ID ${response.ornamentId} saved to DB.`,
        });
        // Generate QR code with ornament data
        setQrCode(qrData);
      } else {
        toast({
          title: "Error adding ornament",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error adding ornament",
        description:
          "There was a problem adding the ornament. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Add New Ornament
      </h1>

      <Tabs defaultValue="manual" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ornament Details</CardTitle>
                <CardDescription>
                  Enter the details of the new ornament to add to inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ornament type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ring">Ring</SelectItem>
                              <SelectItem value="necklace">Necklace</SelectItem>
                              <SelectItem value="earring">Earring</SelectItem>
                              <SelectItem value="bracelet">Bracelet</SelectItem>
                              <SelectItem value="pendant">Pendant</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (grams)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="merchantCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Code</FormLabel>
                          <FormControl>
                            <Input placeholder="MER001" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the unique code for the merchant
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purity</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gold purity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="18K">18K</SelectItem>
                              <SelectItem value="22K">22K</SelectItem>
                              <SelectItem value="24K">24K</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Add Ornament & Generate QR
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>
                  The generated QR code for the ornament
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                {qrCode ? (
                  <div className="text-center">
                    <div className="mx-auto mb-4 border p-2 rounded-md">
                      <QRCodeSVG value={qrCode} size={200} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code to access ornament details
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Fill and submit the form to generate a QR code</p>
                  </div>
                )}
              </CardContent>
              {qrCode && (
                <CardFooter className="flex justify-center">
                  <Button variant="outline" onClick={() => window.print()}>
                    Print QR Code
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload</CardTitle>
              <CardDescription>
                Upload multiple ornaments at once using a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center gap-1">
                    <div className="text-muted-foreground">
                      <p className="mb-2">
                        Drag and drop your CSV file here, or click to browse
                      </p>
                      <Input
                        type="file"
                        className="max-w-sm mx-auto"
                        accept=".csv"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Template</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download our CSV template to ensure your data is formatted
                    correctly
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upload and Process</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
