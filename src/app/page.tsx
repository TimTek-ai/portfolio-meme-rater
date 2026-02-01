"use client";

import { useState, useEffect } from "react";
import { CsvUploader } from "@/components/CsvUploader";
import { TickerInput } from "@/components/TickerInput";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { MemeEditor } from "@/components/MemeEditor";
import { MemeGallery } from "@/components/MemeGallery";
import { SavedPortfolios } from "@/components/SavedPortfolios";
import { InstallPrompt } from "@/components/InstallPrompt";
import { calculatePortfolioSummary } from "@/lib/portfolio";
import { savePortfolio } from "@/lib/storage";
import type { PortfolioRow, PortfolioSummary as Summary } from "@/types/portfolio";

const samplePortfolio: PortfolioRow[] = [
  { ticker: "NVDA", shares: 10, purchasePrice: 450, currentPrice: 890 },
  { ticker: "BTC", shares: 0.5, purchasePrice: 30000, currentPrice: 45000 },
  { ticker: "AAPL", shares: 25, purchasePrice: 142.5, currentPrice: 178.25 },
  { ticker: "ETH", shares: 5, purchasePrice: 1800, currentPrice: 2400 },
  { ticker: "TSLA", shares: 8, purchasePrice: 265, currentPrice: 175 },
  { ticker: "SOL", shares: 50, purchasePrice: 20, currentPrice: 95 },
];

type InputMode = "none" | "csv" | "ticker";

export function Confetti() {
  const [particles, setParticles] = useState<{ id: number; left: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ["#4ade80", "#60a5fa", "#f472b6", "#facc15", "#a78bfa"];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            backgroundColor: p.color,
            animation: `confetti ${2 + Math.random()}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("none");
  const [portfolioData, setPortfolioData] = useState<PortfolioRow[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [portfolioName, setPortfolioName] = useState("");

  const handleUpload = (rows: PortfolioRow[]) => {
    setPortfolioData(rows);
    const newSummary = calculatePortfolioSummary(rows);
    setSummary(newSummary);
    setInputMode("none");

    // Show confetti for big gains
    if (newSummary.percentageReturn > 20) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleSampleData = () => {
    handleUpload(samplePortfolio);
  };

  const handleReset = () => {
    setPortfolioData(null);
    setSummary(null);
    setInputMode("none");
  };

  const handleSave = () => {
    if (portfolioData && portfolioName.trim()) {
      savePortfolio(portfolioName.trim(), portfolioData);
      setShowSaveModal(false);
      setPortfolioName("");
      alert("Portfolio saved!");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2 animate-fadeIn">
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
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98] animate-slideUp"
                  >
                    <div className="text-2xl mb-2">📈</div>
                    <h3 className="font-bold mb-1">Enter Tickers</h3>
                    <p className="text-sm text-gray-400">
                      Stocks & crypto with live prices
                    </p>
                  </button>
                  <button
                    onClick={() => setInputMode("csv")}
                    className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98] animate-slideUp"
                    style={{ animationDelay: "50ms" }}
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <h3 className="font-bold mb-1">Upload CSV</h3>
                    <p className="text-sm text-gray-400">
                      Import from spreadsheet
                    </p>
                  </button>
                </div>

                <SavedPortfolios onLoad={handleUpload} />

                <button
                  onClick={handleSampleData}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-[1.01] active:scale-[0.99] animate-slideUp animate-pulse-glow"
                  style={{ animationDelay: "100ms" }}
                >
                  Try Demo Portfolio (Stocks + Crypto)
                </button>
              </>
            )}

            {inputMode === "ticker" && (
              <div className="space-y-4 animate-fadeIn">
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
              <div className="space-y-4 animate-fadeIn">
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
          <div className="space-y-6 animate-fadeIn">
            {summary && (
              <>
                <div className="animate-scaleIn">
                  <PortfolioSummary summary={summary} />
                </div>

                {/* Save Button */}
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>💾</span> Save Portfolio
                </button>

                {/* Save Modal */}
                {showSaveModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 animate-scaleIn">
                      <h3 className="font-bold mb-4">Save Portfolio</h3>
                      <input
                        type="text"
                        placeholder="Portfolio name"
                        value={portfolioName}
                        onChange={(e) => setPortfolioName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSaveModal(false)}
                          className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!portfolioName.trim()}
                          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Portfolio Meme with Editor */}
                <div className="animate-slideUp" style={{ animationDelay: "100ms" }}>
                  <MemeEditor percentageReturn={summary.percentageReturn} />
                </div>

                {/* Export Options */}
                <div className="animate-slideUp" style={{ animationDelay: "150ms" }}>
                  <MemeGallery summary={summary} />
                </div>

                {/* Individual Holdings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Individual Holdings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.holdings
                      .sort((a, b) => b.percentageGain - a.percentageGain)
                      .map((holding, index) => (
                        <div
                          key={holding.ticker}
                          className="animate-slideUp"
                          style={{ animationDelay: `${200 + index * 50}ms` }}
                        >
                          <MemeEditor
                            percentageReturn={holding.percentageGain}
                            ticker={holding.ticker}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Start Over
            </button>
          </div>
        )}

        <footer className="text-center text-sm text-gray-500 pt-8 animate-fadeIn">
          <p>Not financial advice. Memes are for entertainment only.</p>
        </footer>
      </div>

      <InstallPrompt />
    </main>
  );
}
