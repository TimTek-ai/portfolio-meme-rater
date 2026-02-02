import { NextRequest, NextResponse } from "next/server";

// Map commodity symbols to Yahoo Finance futures symbols
const COMMODITY_MAP: Record<string, string> = {
  "GOLD": "GC=F",    // Gold futures
  "SILVER": "SI=F",  // Silver futures
  "OIL": "CL=F",     // Crude oil (WTI)
  "NATGAS": "NG=F",  // Natural gas
  "COPPER": "HG=F",  // Copper
  "WHEAT": "ZW=F",   // Wheat
  "CORN": "ZC=F",    // Corn
  "PLATINUM": "PL=F", // Platinum
  "PALLADIUM": "PA=F", // Palladium
  "SOYBEAN": "ZS=F", // Soybeans
};

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  const upperSymbol = symbol.toUpperCase();
  const yahooSymbol = COMMODITY_MAP[upperSymbol];

  if (!yahooSymbol) {
    return NextResponse.json(
      { error: `Unknown commodity: ${upperSymbol}. Supported: ${Object.keys(COMMODITY_MAP).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Use Yahoo Finance API (no key required)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch commodity data");
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return NextResponse.json({ error: "Commodity data not found" }, { status: 404 });
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;

    return NextResponse.json({
      symbol: upperSymbol,
      yahooSymbol: meta.symbol,
      price,
      previousClose,
      change: price - previousClose,
      changePercent: ((price - previousClose) / previousClose) * 100,
      currency: meta.currency,
    });
  } catch (error) {
    console.error("Commodity price error:", error);
    return NextResponse.json(
      { error: "Failed to fetch commodity price" },
      { status: 500 }
    );
  }
}
