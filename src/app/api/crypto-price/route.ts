import { NextRequest, NextResponse } from "next/server";

// Map common symbols to CoinGecko IDs
const CRYPTO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  DOGE: "dogecoin",
  ADA: "cardano",
  XRP: "ripple",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  AVAX: "avalanche-2",
  SHIB: "shiba-inu",
  LTC: "litecoin",
  UNI: "uniswap",
  ATOM: "cosmos",
  XLM: "stellar",
  ALGO: "algorand",
  VET: "vechain",
  FTM: "fantom",
  SAND: "the-sandbox",
  MANA: "decentraland",
  APE: "apecoin",
  PEPE: "pepe",
  ARB: "arbitrum",
  OP: "optimism",
};

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  const coinId = CRYPTO_MAP[symbol];

  if (!coinId) {
    return NextResponse.json(
      { error: "Crypto not supported. Try: BTC, ETH, SOL, DOGE, etc." },
      { status: 404 }
    );
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch crypto data");
    }

    const data = await response.json();
    const coinData = data[coinId];

    if (!coinData) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    return NextResponse.json({
      symbol,
      price: coinData.usd,
      change24h: coinData.usd_24h_change || 0,
      isCrypto: true,
    });
  } catch (error) {
    console.error("Crypto price error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto price" },
      { status: 500 }
    );
  }
}
