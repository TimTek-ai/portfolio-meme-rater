"use client";

import { useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import type { PortfolioRow } from "@/types/portfolio";

interface TickerInputProps {
  onSubmit: (rows: PortfolioRow[]) => void;
}

type AssetType = "stock" | "crypto" | "commodity";

interface TickerEntry {
  ticker: string;
  shares: string;
  purchasePrice: string;
  currentPrice: number | null;
  loading: boolean;
  error: string | null;
  assetType: AssetType;
}

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "DOGE", "ADA", "XRP", "DOT", "MATIC", "LINK", "AVAX", "SHIB", "LTC", "UNI", "ATOM", "PEPE", "ARB", "OP"];
const COMMODITY_SYMBOLS = ["GOLD", "SILVER", "OIL", "NATGAS", "COPPER", "WHEAT", "CORN", "PLATINUM", "PALLADIUM", "SOYBEAN"];

function getAssetType(ticker: string): AssetType {
  const upper = ticker.toUpperCase();
  if (CRYPTO_SYMBOLS.includes(upper)) return "crypto";
  if (COMMODITY_SYMBOLS.includes(upper)) return "commodity";
  return "stock";
}

function AssetBadge({ assetType }: { assetType: AssetType }) {
  const badgeClass = {
    stock: "badge-stock",
    crypto: "badge-crypto",
    commodity: "badge-commodity",
  }[assetType];

  const icon = {
    stock: (
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
      </svg>
    ),
    crypto: (
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
      </svg>
    ),
    commodity: (
      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.25 6 2.25v4.78z"/>
      </svg>
    ),
  }[assetType];

  const label = {
    stock: "Stock",
    crypto: "Crypto",
    commodity: "Commodity",
  }[assetType];

  return (
    <span className={`badge ${badgeClass}`}>
      {icon}
      {label}
    </span>
  );
}

export function TickerInput({ onSubmit }: TickerInputProps) {
  const [entries, setEntries] = useState<TickerEntry[]>([
    { ticker: "", shares: "", purchasePrice: "", currentPrice: null, loading: false, error: null, assetType: "stock" },
  ]);

  const fetchPrice = async (index: number, ticker: string) => {
    if (!ticker.trim()) return;

    const upperTicker = ticker.toUpperCase();
    const assetType = getAssetType(upperTicker);

    setEntries((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, loading: true, error: null, assetType } : e
      )
    );

    try {
      const endpoint = {
        stock: "stock-price",
        crypto: "crypto-price",
        commodity: "commodity-price",
      }[assetType];
      const response = await fetch(`/api/${endpoint}?symbol=${upperTicker}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch price");
      }

      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, currentPrice: data.price, loading: false, ticker: upperTicker, assetType }
            : e
        )
      );
    } catch (error) {
      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, error: error instanceof Error ? error.message : "Error", loading: false }
            : e
        )
      );
    }
  };

  const updateEntry = (index: number, field: keyof TickerEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { ticker: "", shares: "", purchasePrice: "", currentPrice: null, loading: false, error: null, assetType: "stock" },
    ]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const validRows: PortfolioRow[] = entries
      .filter((e) => e.ticker && e.shares && e.purchasePrice && e.currentPrice)
      .map((e) => ({
        ticker: e.ticker.toUpperCase(),
        shares: parseFloat(e.shares),
        purchasePrice: parseFloat(e.purchasePrice),
        currentPrice: e.currentPrice!,
      }));

    if (validRows.length > 0) {
      onSubmit(validRows);
    }
  };

  const allValid = entries.some(
    (e) => e.ticker && e.shares && e.purchasePrice && e.currentPrice
  );

  return (
    <div className="card rounded-xl p-5 space-y-4 animate-fadeIn">
      <div>
        <h3 className="font-medium text-lg">Enter Your Holdings</h3>
        <p className="text-sm text-gray-400 mt-1">
          Supports stocks (AAPL, MSFT), crypto (BTC, ETH), and commodities (GOLD, OIL)
        </p>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={index} className="flex gap-2 items-start animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="AAPL / BTC"
                  value={entry.ticker}
                  onChange={(e) => updateEntry(index, "ticker", e.target.value)}
                  onBlur={(e) => fetchPrice(index, e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
                />
                {entry.loading && (
                  <div className="mt-1.5">
                    <Skeleton className="h-4 w-20" />
                  </div>
                )}
                {entry.error && (
                  <p className="text-xs text-red-400 mt-1.5">{entry.error}</p>
                )}
                {entry.currentPrice && !entry.loading && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-green-400 font-medium">
                      ${entry.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <AssetBadge assetType={entry.assetType} />
                  </div>
                )}
              </div>
              <input
                type="number"
                placeholder="Shares"
                value={entry.shares}
                onChange={(e) => updateEntry(index, "shares", e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
              />
              <input
                type="number"
                placeholder="Buy price"
                value={entry.purchasePrice}
                onChange={(e) => updateEntry(index, "purchasePrice", e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
              />
            </div>
            <button
              onClick={() => removeEntry(index)}
              className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              disabled={entries.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={addEntry}
          className="flex-1 py-2.5 px-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all border border-gray-600 hover:border-gray-500"
        >
          + Add Ticker
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allValid}
          className="flex-1 py-2.5 px-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all"
        >
          Generate Memes
        </button>
      </div>
    </div>
  );
}
