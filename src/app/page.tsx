"use client";

import { useState, useEffect } from "react";
import { CsvUploader } from "@/components/CsvUploader";
import { TickerInput } from "@/components/TickerInput";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { MemeEditor } from "@/components/MemeEditor";
import { MemeGallery } from "@/components/MemeGallery";
import { SavedPortfolios } from "@/components/SavedPortfolios";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useToast } from "@/components/Toast";
import { RoastDisplay } from "@/components/RoastDisplay";
import { Leaderboard } from "@/components/Leaderboard";
import { PortfolioWrapped } from "@/components/PortfolioWrapped";
import { calculatePortfolioSummary } from "@/lib/portfolio";
import { savePortfolio } from "@/lib/storage";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { PortfolioRow, PortfolioSummary as Summary } from "@/types/portfolio";

// Asset pool for random portfolio generation
const ASSET_POOL = [
  // Stocks
  { ticker: "NVDA", type: "stock", basePrice: 800, volatility: 0.4 },
  { ticker: "AAPL", type: "stock", basePrice: 175, volatility: 0.15 },
  { ticker: "TSLA", type: "stock", basePrice: 250, volatility: 0.35 },
  { ticker: "MSFT", type: "stock", basePrice: 420, volatility: 0.12 },
  { ticker: "GOOGL", type: "stock", basePrice: 170, volatility: 0.18 },
  { ticker: "AMD", type: "stock", basePrice: 160, volatility: 0.3 },
  { ticker: "META", type: "stock", basePrice: 500, volatility: 0.25 },
  // Crypto
  { ticker: "BTC", type: "crypto", basePrice: 95000, volatility: 0.5 },
  { ticker: "ETH", type: "crypto", basePrice: 3500, volatility: 0.45 },
  { ticker: "SOL", type: "crypto", basePrice: 180, volatility: 0.6 },
  { ticker: "DOGE", type: "crypto", basePrice: 0.35, volatility: 0.7 },
  { ticker: "PEPE", type: "crypto", basePrice: 0.00002, volatility: 0.8 },
  { ticker: "XRP", type: "crypto", basePrice: 2.5, volatility: 0.4 },
  // Commodities
  { ticker: "GOLD", type: "commodity", basePrice: 2300, volatility: 0.1 },
  { ticker: "SILVER", type: "commodity", basePrice: 28, volatility: 0.15 },
  { ticker: "OIL", type: "commodity", basePrice: 75, volatility: 0.25 },
  { ticker: "COPPER", type: "commodity", basePrice: 4.2, volatility: 0.2 },
  { ticker: "NATGAS", type: "commodity", basePrice: 3.5, volatility: 0.35 },
  { ticker: "PLATINUM", type: "commodity", basePrice: 1000, volatility: 0.18 },
  { ticker: "WHEAT", type: "commodity", basePrice: 5.5, volatility: 0.22 },
];

function generateRandomPortfolio(): PortfolioRow[] {
  // Pick 4-8 random assets
  const numAssets = Math.floor(Math.random() * 5) + 4;
  const shuffled = [...ASSET_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numAssets);

  return selected.map((asset) => {
    // Generate random price movement (-50% to +150%)
    const priceChange = (Math.random() * 2 - 0.5) * asset.volatility;
    const currentMultiplier = 1 + priceChange;

    // Purchase price was some time ago (simulate buying at different times)
    const purchaseMultiplier = 1 + (Math.random() * 0.3 - 0.15);
    const purchasePrice = asset.basePrice * purchaseMultiplier;
    const currentPrice = asset.basePrice * currentMultiplier;

    // Random share count based on price tier
    let shares: number;
    if (asset.basePrice > 10000) {
      shares = Math.round((Math.random() * 2 + 0.1) * 100) / 100; // 0.1-2.1 for BTC
    } else if (asset.basePrice > 100) {
      shares = Math.floor(Math.random() * 50) + 5; // 5-55 shares
    } else if (asset.basePrice > 1) {
      shares = Math.floor(Math.random() * 500) + 50; // 50-550 shares
    } else {
      shares = Math.floor(Math.random() * 1000000) + 100000; // 100k-1.1M for micro-price assets
    }

    return {
      ticker: asset.ticker,
      shares,
      purchasePrice: Math.round(purchasePrice * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
    };
  });
}

type InputMode = "none" | "csv" | "ticker";
type TabName = "summary" | "memes" | "leaderboard";

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

function ChartIcon() {
  return (
    <svg
      className="w-10 h-10 md:w-12 md:h-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b82f6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("none");
  const [portfolioData, setPortfolioData] = useState<PortfolioRow[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showWrapped, setShowWrapped] = useState(false);
  const [portfolioName, setPortfolioName] = useState("");
  const [activeTab, setActiveTab] = useState<TabName>("summary");
  const { showToast } = useToast();

  const handleUpload = (rows: PortfolioRow[]) => {
    setPortfolioData(rows);
    const newSummary = calculatePortfolioSummary(rows);
    setSummary(newSummary);
    setInputMode("none");
    setActiveTab("summary");

    // Show confetti for big gains
    if (newSummary.percentageReturn > 20) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleSampleData = () => {
    handleUpload(generateRandomPortfolio());
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
      showToast("Portfolio saved successfully!", "success");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      {showConfetti && <Confetti />}
      {showWrapped && portfolioData && (
        <PortfolioWrapped
          holdings={portfolioData}
          onClose={() => setShowWrapped(false)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-4 animate-fadeIn py-6 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center gap-3">
            <ChartIcon />
            <h1 className="text-3xl md:text-5xl font-bold text-blue-500">
              Portfolio Meme Rater
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Turn your <span className="text-green-500 font-medium">gains</span> (or{" "}
            <span className="text-red-500 font-medium">losses</span>) into viral memes
          </p>
        </header>

        {!portfolioData ? (
          <div className="space-y-4">
            {inputMode === "none" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setInputMode("ticker")}
                    className="input-card p-6 rounded-xl text-left animate-slideUp group"
                  >
                    <div className="text-3xl mb-3 group-hover:animate-bounce-subtle transition-transform">
                      📈
                    </div>
                    <h3 className="font-bold text-lg mb-1">Enter Tickers</h3>
                    <p className="text-sm text-gray-400">
                      Stocks & crypto with live prices
                    </p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <span className="badge badge-stock">Stocks</span>
                      <span className="badge badge-crypto">Crypto</span>
                      <span className="badge badge-commodity">Commodities</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputMode("csv")}
                    className="input-card p-6 rounded-xl text-left animate-slideUp group"
                    style={{ animationDelay: "50ms" }}
                  >
                    <div className="text-3xl mb-3 group-hover:animate-bounce-subtle transition-transform">
                      📄
                    </div>
                    <h3 className="font-bold text-lg mb-1">Upload CSV</h3>
                    <p className="text-sm text-gray-400">
                      Import from spreadsheet
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      ticker, shares, purchase_price, current_price
                    </div>
                  </button>
                </div>

                <SavedPortfolios onLoad={handleUpload} />

                <button
                  onClick={handleSampleData}
                  className="w-full py-4 px-4 btn-primary rounded-xl font-medium transition-all hover:scale-[1.01] active:scale-[0.99] animate-slideUp text-lg"
                  style={{ animationDelay: "100ms" }}
                >
                  Try Demo Portfolio
                  <span className="text-sm opacity-80 ml-2">(Stocks + Crypto + Commodities)</span>
                </button>
              </>
            )}

            {inputMode === "ticker" && (
              <div className="space-y-4 animate-fadeIn">
                <button
                  onClick={() => setInputMode("none")}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>←</span> Back
                </button>
                <TickerInput onSubmit={handleUpload} />
              </div>
            )}

            {inputMode === "csv" && (
              <div className="space-y-4 animate-fadeIn">
                <button
                  onClick={() => setInputMode("none")}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>←</span> Back
                </button>
                <CsvUploader onUpload={handleUpload} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {summary && (
              <>
                {/* Tab Navigation */}
                <div className="border-b border-gray-700">
                  <nav className="flex gap-8">
                    {[
                      { id: "summary" as TabName, label: "Summary" },
                      { id: "memes" as TabName, label: "Memes" },
                      { id: "leaderboard" as TabName, label: "Leaderboard" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-sm font-medium transition-colors relative ${
                          activeTab === tab.id
                            ? "text-blue-500"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <div className="animate-scaleIn">
                      <PortfolioSummary summary={summary} />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="py-3 px-4 card rounded-lg text-sm transition-all flex items-center justify-center gap-2 hover:border-blue-500/50"
                      >
                        Save Portfolio
                      </button>
                      <button
                        onClick={() => setShowWrapped(true)}
                        className="py-3 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        Portfolio Wrapped
                      </button>
                    </div>

                    {/* Roast My Portfolio - Minimized */}
                    <RoastDisplay percentageReturn={summary.percentageReturn} />
                  </div>
                )}

                {activeTab === "memes" && (
                  <div className="space-y-6">
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
                  </div>
                )}

                {activeTab === "leaderboard" && (
                  <Leaderboard
                    currentReturn={summary.percentageReturn}
                    currentTicker={summary.holdings.length === 1 ? summary.holdings[0].ticker : undefined}
                  />
                )}

                {/* Save Modal */}
                {showSaveModal && (
                  <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 animate-fadeIn">
                    <div className="card rounded-xl p-6 w-full max-w-md mx-4 animate-scaleIn">
                      <h3 className="font-bold text-lg mb-4">Save Portfolio</h3>
                      <input
                        type="text"
                        placeholder="Portfolio name"
                        value={portfolioName}
                        onChange={(e) => setPortfolioName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700/50 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                        autoFocus
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowSaveModal(false)}
                          className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!portfolioName.trim()}
                          className="flex-1 py-3 px-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all border border-gray-600"
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
