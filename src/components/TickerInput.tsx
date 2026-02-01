"use client";

import { useState } from "react";
import type { PortfolioRow } from "@/types/portfolio";

interface TickerInputProps {
  onSubmit: (rows: PortfolioRow[]) => void;
}

interface TickerEntry {
  ticker: string;
  shares: string;
  purchasePrice: string;
  currentPrice: number | null;
  loading: boolean;
  error: string | null;
  isCrypto: boolean;
}

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "DOGE", "ADA", "XRP", "DOT", "MATIC", "LINK", "AVAX", "SHIB", "LTC", "UNI", "ATOM", "PEPE", "ARB", "OP"];

export function TickerInput({ onSubmit }: TickerInputProps) {
  const [entries, setEntries] = useState<TickerEntry[]>([
    { ticker: "", shares: "", purchasePrice: "", currentPrice: null, loading: false, error: null, isCrypto: false },
  ]);

  const fetchPrice = async (index: number, ticker: string) => {
    if (!ticker.trim()) return;

    const upperTicker = ticker.toUpperCase();
    const isCrypto = CRYPTO_SYMBOLS.includes(upperTicker);

    setEntries((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, loading: true, error: null, isCrypto } : e
      )
    );

    try {
      const endpoint = isCrypto ? "crypto-price" : "stock-price";
      const response = await fetch(`/api/${endpoint}?symbol=${upperTicker}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch price");
      }

      setEntries((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, currentPrice: data.price, loading: false, ticker: upperTicker, isCrypto }
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
      { ticker: "", shares: "", purchasePrice: "", currentPrice: null, loading: false, error: null, isCrypto: false },
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
    <div className="bg-gray-800 rounded-lg p-4 space-y-4 animate-fadeIn">
      <h3 className="font-medium">Enter Your Holdings</h3>
      <p className="text-sm text-gray-400">
        Supports stocks (AAPL, MSFT) and crypto (BTC, ETH, SOL)
      </p>

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
                  className="w-full px-3 py-2 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {entry.loading && (
                  <p className="text-xs text-gray-400 mt-1 animate-pulse">Loading...</p>
                )}
                {entry.error && (
                  <p className="text-xs text-red-400 mt-1">{entry.error}</p>
                )}
                {entry.currentPrice && (
                  <p className="text-xs text-green-400 mt-1">
                    ${entry.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {entry.isCrypto && " ₿"}
                  </p>
                )}
              </div>
              <input
                type="number"
                placeholder="Shares"
                value={entry.shares}
                onChange={(e) => updateEntry(index, "shares", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="number"
                placeholder="Buy price"
                value={entry.purchasePrice}
                onChange={(e) => updateEntry(index, "purchasePrice", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={() => removeEntry(index)}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
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
          className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          + Add Ticker
        </button>
        <button
          onClick={handleSubmit}
          disabled={!allValid}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Generate Memes
        </button>
      </div>
    </div>
  );
}
