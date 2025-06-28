import { NextResponse } from "next/server"

// Cache the price for 5 minutes to avoid hitting API limits
let cachedData: { price: number; timestamp: string } | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
  try {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Fetch current gold price from GoldPriceZ API
    const response = await fetch(
      'https://goldpricez.com/api/rates/currency/inr/measure/gram',
      {
        headers: {
          'X-API-KEY': process.env.GOLDPRICEZ_API_KEY || 'YOUR_API_KEY'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch gold price');
    }

    const data = await response.json();
    
    // Get price per gram in INR
    const pricePerGram = parseFloat(data.gram_in_inr);
    
    // Cache the result
    cachedData = {
      price: Math.round(pricePerGram * 100) / 100, // Round to 2 decimal places
      timestamp: new Date().toISOString(),
    };
    cacheTime = now;

    return NextResponse.json(cachedData);
  } catch (error) {
    console.error('Error fetching gold price:', error);
    
    // Fallback to a default price if API fails
    return NextResponse.json({
      price: 6245.75,
      timestamp: new Date().toISOString(),
      isDefaultPrice: true
    });
  }
}
