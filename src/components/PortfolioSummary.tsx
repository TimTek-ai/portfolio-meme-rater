"use client";

import type { PortfolioSummary as Summary } from "@/types/portfolio";

interface PortfolioSummaryProps {
  summary: Summary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const returnColor = summary.percentageReturn >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold">Portfolio Summary</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Invested</p>
          <p className="text-lg font-medium">{formatCurrency(summary.totalInvested)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Current Value</p>
          <p className="text-lg font-medium">{formatCurrency(summary.currentValue)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Total Return</p>
          <p className={`text-lg font-medium ${returnColor}`}>
            {formatCurrency(summary.totalReturn)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Percentage Return</p>
          <p className={`text-lg font-bold ${returnColor}`}>
            {formatPercent(summary.percentageReturn)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Holdings</h3>
        <div className="space-y-2">
          {summary.holdings.map((holding) => (
            <div
              key={holding.ticker}
              className="flex justify-between items-center text-sm"
            >
              <span className="font-medium">{holding.ticker}</span>
              <span className={holding.percentageGain >= 0 ? "text-green-400" : "text-red-400"}>
                {formatPercent(holding.percentageGain)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
