import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const lowerPrompt = prompt.toLowerCase();

    let fromCity = "";
    let toCity = "";
    let vehicleType = "all";
    let sortBy = "default";
    let passengers = 1;
    let maxPrice: number | null = null;
    let targetDate = "";

    // Extract Origin
    if (lowerPrompt.includes("from ")) {
      const parts = lowerPrompt.split("from ");
      if (parts[1]) {
        const nextWord = parts[1].trim().split(" ")[0];
        fromCity = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
      }
    }

    // Extract Destination
    if (lowerPrompt.includes("to ")) {
      const parts = lowerPrompt.split("to ");
      if (parts[1]) {
        const nextWord = parts[1].trim().split(" ")[0];
        toCity = nextWord.charAt(0).toUpperCase() + nextWord.slice(1);
      }
    }

    // Extract Passenger Count (e.g., "for 2 people", "3 seats")
    const passengerMatch = lowerPrompt.match(/(\d+)\s*(people|person|seats|passenger)/);
    if (passengerMatch && passengerMatch[1]) {
      passengers = parseInt(passengerMatch[1], 10);
    }

    // Extract Max Price (e.g., "under 2000", "below 1500 rs")
    const priceMatch = lowerPrompt.match(/(under|below|upto|less than)\s*(\d+)/);
    if (priceMatch && priceMatch[2]) {
      maxPrice = parseInt(priceMatch[2], 10);
    }

    // Extract Vehicle Category
    if (lowerPrompt.includes("car") || lowerPrompt.includes("private")) {
      vehicleType = "car";
    } else if (lowerPrompt.includes("van") || lowerPrompt.includes("adda") || lowerPrompt.includes("bus")) {
      vehicleType = "van";
    } else if (lowerPrompt.includes("cargo")) {
      vehicleType = "cargo";
    }

    // Extract Price Sorting
    if (lowerPrompt.includes("cheap") || lowerPrompt.includes("low") || lowerPrompt.includes("budget") || lowerPrompt.includes("cheapest")) {
      sortBy = "price-asc";
    }

    return NextResponse.json({
      from: fromCity,
      to: toCity,
      passengers: passengers,
      vehicleType: vehicleType,
      sortBy: sortBy,
      maxPrice: maxPrice,
      date: targetDate
    });
  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ error: "Failed to parse search query" }, { status: 500 });
  }
}