"use client";

import type { PortfolioSummary as Summary } from "@/types/portfolio";
import { AnimatedCurrency, AnimatedPercent } from "@/components/AnimatedNumber";

interface PortfolioSummaryProps {
  summary: Summary;
}

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "DOGE", "ADA", "XRP", "DOT", "MATIC", "LINK", "AVAX", "SHIB", "LTC", "UNI", "ATOM", "PEPE", "ARB", "OP"];
const COMMODITY_SYMBOLS = ["GOLD", "SILVER", "OIL", "NATGAS", "COPPER", "WHEAT", "CORN", "PLATINUM", "PALLADIUM", "SOYBEAN"];

type AssetType = "stock" | "crypto" | "commodity";

function getAssetType(ticker: string): AssetType {
  const upper = ticker.toUpperCase();
  if (CRYPTO_SYMBOLS.includes(upper)) return "crypto";
  if (COMMODITY_SYMBOLS.includes(upper)) return "commodity";
  return "stock";
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

// Colors for the donut chart
const CHART_COLORS = [
  "#60a5fa", // blue
  "#f472b6", // pink
  "#4ade80", // green
  "#facc15", // yellow
  "#a78bfa", // purple
  "#fb923c", // orange
  "#22d3ee", // cyan
  "#f87171", // red
];

function DonutChart({ holdings }: { holdings: Summary["holdings"] }) {
  const total = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full donut-chart">
        {holdings.map((holding, index) => {
          const percent = (holding.currentValue / total) * 100;
          const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
          accumulatedPercent += percent;

          return (
            <circle
              key={holding.ticker}
              cx="50"
              cy="50"
              r={radius}
              className="donut-segment"
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-gray-400">{holdings.length} assets</span>
      </div>
    </div>
  );
}

function AssetBadge({ ticker }: { ticker: string }) {
  const assetType = getAssetType(ticker);
  const badgeClass = {
    stock: "badge-stock",
    crypto: "badge-crypto",
    commodity: "badge-commodity",
  }[assetType];
  const label = {
    stock: "Stock",
    crypto: "Crypto",
    commodity: "Commodity",
  }[assetType];

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const returnColor = summary.percentageReturn >= 0 ? "text-green-400" : "text-red-400";
  const returnBgColor = summary.percentageReturn >= 0 ? "bg-green-500/10" : "bg-red-500/10";

  // Calculate progress for the visual bar (clamped between -100 and 100)
  const progressPercent = Math.min(Math.max(summary.percentageReturn, -100), 100);
  const progressWidth = summary.percentageReturn >= 0 ? progressPercent : Math.abs(progressPercent);

  return (
    <div className="card rounded-xl p-6 space-y-6">
      {/* Header with Return Percentage */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">Portfolio Summary</h2>
          <p className="text-sm text-gray-400">
            {summary.holdings.length} holdings
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl ${returnBgColor}`}>
          <AnimatedPercent
            value={summary.percentageReturn}
            duration={1200}
            className={`text-2xl font-bold ${returnColor} ${summary.percentageReturn >= 0 ? "gain-glow" : "loss-glow"}`}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Performance</span>
          <AnimatedCurrency value={summary.totalReturn} duration={1200} className={returnColor} />
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${summary.percentageReturn >= 0 ? "progress-gain" : "progress-loss"}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Stats and Chart */}
      <div className="flex gap-6 items-center">
        <DonutChart holdings={summary.holdings} />

        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Invested</p>
            <AnimatedCurrency value={summary.totalInvested} duration={1000} className="text-lg font-semibold" />
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Current Value</p>
            <AnimatedCurrency value={summary.currentValue} duration={1000} className="text-lg font-semibold" />
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Total Return</p>
            <AnimatedCurrency value={summary.totalReturn} duration={1200} className={`text-lg font-semibold ${returnColor}`} />
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Best Performer</p>
            <p className="text-lg font-semibold text-green-400">
              {summary.holdings.length > 0
                ? summary.holdings.reduce((best, h) => h.percentageGain > best.percentageGain ? h : best).ticker
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="border-t border-gray-700/50 pt-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <span>Holdings</span>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{summary.holdings.length}</span>
        </h3>
        <div className="space-y-2">
          {summary.holdings
            .sort((a, b) => b.percentageGain - a.percentageGain)
            .map((holding, index) => (
              <div
                key={holding.ticker}
                className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <div>
                    <span className="font-medium">{holding.ticker}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <AssetBadge ticker={holding.ticker} />
                      <span className="text-xs text-gray-500">
                        {formatCurrency(holding.currentValue)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`font-medium ${holding.percentageGain >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatPercent(holding.percentageGain)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
