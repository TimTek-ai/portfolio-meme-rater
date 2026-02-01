"use client";

import { useState } from "react";
import { CsvUploader } from "@/components/CsvUploader";
import { TickerInput } from "@/components/TickerInput";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { MemeEditor } from "@/components/MemeEditor";
import { MemeGallery } from "@/components/MemeGallery";
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

type InputMode = "none" | "csv" | "ticker";

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("none");
  const [portfolioData, setPortfolioData] = useState<PortfolioRow[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const handleUpload = (rows: PortfolioRow[]) => {
    setPortfolioData(rows);
    setSummary(calculatePortfolioSummary(rows));
    setInputMode("none");
  };

  const handleSampleData = () => {
    handleUpload(samplePortfolio);
  };

  const handleReset = () => {
    setPortfolioData(null);
    setSummary(null);
    setInputMode("none");
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Portfolio Meme Rater
          </h1>
          <p className="text-gray-400">
            Turn your gains (or losses) into memes
          </p>
        </header>

        {!portfolioData ? (
          <div className="space-y-4">
            {inputMode === "none" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setInputMode("ticker")}
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">📈</div>
                    <h3 className="font-bold mb-1">Enter Tickers</h3>
                    <p className="text-sm text-gray-400">
                      Auto-fetch live prices from the market
                    </p>
                  </button>
                  <button
                    onClick={() => setInputMode("csv")}
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <h3 className="font-bold mb-1">Upload CSV</h3>
                    <p className="text-sm text-gray-400">
                      Import from spreadsheet with custom prices
                    </p>
                  </button>
                </div>
                <button
                  onClick={handleSampleData}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Try Demo Portfolio
                </button>
              </>
            )}

            {inputMode === "ticker" && (
              <div className="space-y-4">
                <button
                  onClick={() => setInputMode("none")}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <TickerInput onSubmit={handleUpload} />
              </div>
            )}

            {inputMode === "csv" && (
              <div className="space-y-4">
                <button
                  onClick={() => setInputMode("none")}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <CsvUploader onUpload={handleUpload} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {summary && (
              <>
                <PortfolioSummary summary={summary} />

                {/* Overall Portfolio Meme with Editor */}
                <MemeEditor percentageReturn={summary.percentageReturn} />

                {/* Export Options */}
                <MemeGallery summary={summary} />

                {/* Individual Holdings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Individual Holdings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.holdings
                      .sort((a, b) => b.percentageGain - a.percentageGain)
                      .map((holding) => (
                        <MemeEditor
                          key={holding.ticker}
                          percentageReturn={holding.percentageGain}
                          ticker={holding.ticker}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              Start Over
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
