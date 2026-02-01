"use client";

import { useState } from "react";
import { CsvUploader } from "@/components/CsvUploader";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { MemeDisplay } from "@/components/MemeDisplay";
import { HoldingCard } from "@/components/HoldingCard";
import { InstallPrompt } from "@/components/InstallPrompt";
import { calculatePortfolioSummary } from "@/lib/portfolio";
import type { PortfolioRow, PortfolioSummary as Summary } from "@/types/portfolio";

const samplePortfolio: PortfolioRow[] = [
  { ticker: "NVDA", shares: 10, purchasePrice: 450, currentPrice: 890 },
  { ticker: "AAPL", shares: 25, purchasePrice: 142.5, currentPrice: 178.25 },
  { ticker: "MSFT", shares: 15, purchasePrice: 285, currentPrice: 415.5 },
  { ticker: "TSLA", shares: 8, purchasePrice: 265, currentPrice: 175 },
  { ticker: "META", shares: 12, purchasePrice: 180, currentPrice: 485 },
  { ticker: "AMD", shares: 20, purchasePrice: 95, currentPrice: 158 },
];

export default function Home() {
  const [portfolioData, setPortfolioData] = useState<PortfolioRow[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const handleUpload = (rows: PortfolioRow[]) => {
    setPortfolioData(rows);
    setSummary(calculatePortfolioSummary(rows));
  };

  const handleSampleData = () => {
    handleUpload(samplePortfolio);
  };

  const handleReset = () => {
    setPortfolioData(null);
    setSummary(null);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Portfolio Meme Rater
          </h1>
          <p className="text-gray-400">
            Upload your portfolio and get memes for each holding
          </p>
        </header>

        {!portfolioData ? (
          <div className="space-y-4">
            <CsvUploader onUpload={handleUpload} />
            <div className="text-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>
            <button
              onClick={handleSampleData}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Try with Sample Portfolio
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {summary && (
              <>
                <PortfolioSummary summary={summary} />
                <MemeDisplay percentageReturn={summary.percentageReturn} />

                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Individual Holdings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.holdings
                      .sort((a, b) => b.percentageGain - a.percentageGain)
                      .map((holding) => (
                        <HoldingCard key={holding.ticker} holding={holding} />
                      ))}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              Upload Different Portfolio
            </button>
          </div>
        )}

        <footer className="text-center text-sm text-gray-500 pt-8">
          <p>Not financial advice. Memes are for entertainment only.</p>
        </footer>
      </div>

      <InstallPrompt />
    </main>
  );
}
