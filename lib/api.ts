// API client functions for interacting with the backend

// Dashboard data
export async function fetchDashboardData() {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch('/api/dashboard')
    // const data = await response.json()
    // return data

    // Mock data for now
    return {
      totalRevenue: 1245670,
      itemsInStock: 245,
      totalSales: 89,
      loading: false,
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Sales chart data
export async function fetchSalesData() {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch('/api/sales/chart')
    // const data = await response.json()
    // return data

    // Mock data for now
    return [
      { month: "Jan", sales: 125000 },
      { month: "Feb", sales: 165000 },
      { month: "Mar", sales: 145000 },
      { month: "Apr", sales: 185000 },
      { month: "May", sales: 205000 },
      { month: "Jun", sales: 175000 },
      { month: "Jul", sales: 195000 },
      { month: "Aug", sales: 235000 },
      { month: "Sep", sales: 225000 },
      { month: "Oct", sales: 255000 },
      { month: "Nov", sales: 275000 },
      { month: "Dec", sales: 325000 },
    ];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Inventory chart data
export async function fetchInventoryData() {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch('/api/inventory/chart')
    // const data = await response.json()
    // return data

    // Mock data for now
    return [
      { name: "Rings", value: 85, color: "#f59e0b" },
      { name: "Necklaces", value: 65, color: "#0ea5e9" },
      { name: "Earrings", value: 45, color: "#10b981" },
      { name: "Bracelets", value: 30, color: "#8b5cf6" },
      { name: "Pendants", value: 20, color: "#ec4899" },
    ];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Recent sales data
export async function fetchRecentSales() {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch('/api/sales/recent')
    // const data = await response.json()
    // return data

    // Mock data for now
    return [
      {
        id: 1,
        client: "Priya Sharma",
        email: "priya@example.com",
        amount: "₹42,500",
        date: "2 hours ago",
        items: 3,
        initials: "PS",
      },
      {
        id: 2,
        client: "Rahul Patel",
        email: "rahul@example.com",
        amount: "₹18,950",
        date: "4 hours ago",
        items: 1,
        initials: "RP",
      },
      {
        id: 3,
        client: "Ananya Singh",
        email: "ananya@example.com",
        amount: "₹56,200",
        date: "Yesterday",
        items: 4,
        initials: "AS",
      },
      {
        id: 4,
        client: "Vikram Mehta",
        email: "vikram@example.com",
        amount: "₹32,800",
        date: "Yesterday",
        items: 2,
        initials: "VM",
      },
    ];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// /lib/api.ts
export async function addOrnament(ornamentData: any) {
  const res = await fetch("/api/add-ornament", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ornamentData),
  });

  return res.json(); // returns { success: true, ornamentId: "..." }
}

// // Add ornament
// export async function addOrnament(ornamentData: any) {
//   try {
//     // In a real app, this would send to the backend
//     // const response = await fetch('/api/add-ornament', {
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //   },
//     //   body: JSON.stringify(ornamentData),
//     // })
//     // const data = await response.json()
//     // return data

//     // Mock response for now
//     return {
//       success: true,
//       ornamentId: ornamentData.ornamentId,
//     }
//   } catch (error) {
//     console.error("API Error:", error)
//     throw error
//   }
// }

// Fetch stock data
export async function fetchStock(filters: any) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.merchant) queryParams.append('merchant', filters.merchant);
    if (filters.purity) queryParams.append('purity', filters.purity);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetch(`/api/stock?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Return empty array on error to prevent UI from breaking
  }
}

// Scan QR code and get item details
export async function scanQrCode(qrData: string) {
  try {
    const response = await fetch('/api/scan-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scan QR code');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Generate bill
export async function generateBill(billData: {
  clientName: string;
  clientPhone: string;
  items: Array<{
    ornamentId: string;
    sellingPrice: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}) {
  try {
    const response = await fetch('/api/generate-bill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate bill');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Fetch sales history
export async function fetchSalesHistory(filters: {
  date?: string;
  paymentMethod?: string;
  search?: string;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetch(`/api/sales?${queryParams.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch sales history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Fetch clients
export async function fetchClients(searchTerm = "") {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch(`/api/clients?search=${encodeURIComponent(searchTerm)}`)
    // const data = await response.json()
    // return data

    // Mock data for now
    const mockData = [
      {
        id: 1,
        name: "Priya Sharma",
        phone: "9876543210",
        email: "priya@example.com",
        totalPurchases: 3,
        totalSpent: 42500,
        lastPurchase: "2023-04-15",
      },
      {
        id: 2,
        name: "Rahul Patel",
        phone: "8765432109",
        email: "rahul@example.com",
        totalPurchases: 1,
        totalSpent: 18950,
        lastPurchase: "2023-04-14",
      },
      {
        id: 3,
        name: "Ananya Singh",
        phone: "7654321098",
        email: "ananya@example.com",
        totalPurchases: 4,
        totalSpent: 56200,
        lastPurchase: "2023-04-13",
      },
    ];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return mockData.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.phone.includes(searchTerm) ||
          (client.email && client.email.toLowerCase().includes(searchLower))
      );
    }

    return mockData;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Add client
export async function addClient(clientData: any) {
  try {
    // In a real app, this would send to the backend
    // const response = await fetch('/api/clients', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(clientData),
    // })
    // const data = await response.json()
    // return data

    // Mock response for now
    return {
      success: true,
      clientId: Math.floor(1000 + Math.random() * 9000),
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Fetch client details
export async function fetchClientDetails(clientId: string) {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch(`/api/clients/${clientId}`)
    // const data = await response.json()
    // return data

    // Mock data for now
    return {
      id: Number.parseInt(clientId),
      name: "Priya Sharma",
      phone: "9876543210",
      email: "priya@example.com",
      createdAt: "2023-01-15",
      totalPurchases: 3,
      totalSpent: 42500,
      lastPurchase: "2023-04-15",
      purchases: [
        {
          billId: "BILL001",
          date: "2023-04-15",
          items: 3,
          amount: 42500,
          paymentMethod: "cash",
        },
        {
          billId: "BILL002",
          date: "2023-03-22",
          items: 1,
          amount: 18950,
          paymentMethod: "card",
        },
        {
          billId: "BILL003",
          date: "2023-02-10",
          items: 2,
          amount: 35000,
          paymentMethod: "upi",
        },
      ],
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Fetch merchants
export async function fetchMerchants(searchTerm = "") {
  try {
    console.log('Fetching merchants with search term:', searchTerm);
    const response = await fetch(`/api/merchants?search=${encodeURIComponent(searchTerm)}`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch merchants: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received merchants:', data);
    
    // Transform the data to match the expected format
    return data.map((merchant: any) => ({
      id: merchant.id,
      name: merchant.name,
      merchantCode: merchant.merchantCode,
      phone: merchant.phone,
      totalOrnaments: merchant.totalOrnaments || 0,
      totalValue: merchant.totalValue || 0,
      createdAt: merchant.createdAt
    }));
  } catch (error) {
    console.error("API Error:", error);
    // Return empty array on error to prevent UI from breaking
    return [];
  }
}

// Add merchant
export async function addMerchant(merchant: {
  merchantCode: string;
  name: string;
  phone: string;
}) {
  const res = await fetch("/api/merchants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(merchant),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add merchant");
  return data.merchant;
}

// Fetch merchant details
export async function fetchMerchantDetails(merchantId: string) {
  try {
    // In a real app, this would fetch from the backend
    // const response = await fetch(`/api/merchants/${merchantId}`)
    // const data = await response.json()
    // return data

    // Mock data for now
    return {
      id: Number.parseInt(merchantId),
      name: "Rajesh Jewelers",
      merchantCode: "MER001",
      phone: "9876543210",
      createdAt: "2023-01-10",
      totalOrnaments: 45,
      inStock: 30,
      sold: 15,
      totalValue: 450000,
      ornaments: [
        {
          ornamentId: "R001",
          type: "ring",
          weight: 8.5,
          purity: "22K",
          costPrice: 42500,
          status: "in_stock",
        },
        {
          ornamentId: "N001",
          type: "necklace",
          weight: 15.2,
          purity: "24K",
          costPrice: 76000,
          status: "in_stock",
        },
        {
          ornamentId: "E001",
          type: "earring",
          weight: 4.8,
          purity: "18K",
          costPrice: 24000,
          status: "sold",
        },
      ],
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
