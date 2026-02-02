"use client";

import { useState, useEffect, useRef } from "react";
import { selectMemeTemplate, getMemeImageUrl, formatMemeText } from "@/lib/imgflip";
import type { PortfolioRow } from "@/types/portfolio";

interface MonthlyData {
  month: string;
  monthShort: string;
  percentageReturn: number;
  topPerformer: string;
  worstPerformer: string;
  totalValue: number;
}

interface WrappedProps {
  holdings: PortfolioRow[];
  onClose: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Generate simulated monthly data based on current holdings
function generateMonthlyData(holdings: PortfolioRow[]): MonthlyData[] {
  const data: MonthlyData[] = [];
  let cumulativeReturn = 0;

  for (let i = 0; i < 12; i++) {
    // Simulate monthly volatility
    const monthlyChange = (Math.random() - 0.45) * 15; // -6.75% to +8.25% per month
    cumulativeReturn += monthlyChange;

    // Pick random top/worst performers from holdings
    const shuffled = [...holdings].sort(() => Math.random() - 0.5);
    const topPerformer = shuffled[0]?.ticker || "N/A";
    const worstPerformer = shuffled[shuffled.length - 1]?.ticker || "N/A";

    // Calculate simulated total value
    const baseValue = holdings.reduce((sum, h) => sum + h.purchasePrice * h.shares, 0);
    const totalValue = baseValue * (1 + cumulativeReturn / 100);

    data.push({
      month: MONTHS[i],
      monthShort: MONTHS_SHORT[i],
      percentageReturn: Math.round(cumulativeReturn * 10) / 10,
      topPerformer,
      worstPerformer,
      totalValue: Math.round(totalValue),
    });
  }

  return data;
}

// Get mood/vibe for the month based on performance
function getMonthMood(percentageReturn: number): { emoji: string; vibe: string; color: string } {
  if (percentageReturn > 20) return { emoji: "🚀", vibe: "TO THE MOON", color: "from-green-400 to-emerald-600" };
  if (percentageReturn > 10) return { emoji: "🎉", vibe: "WINNING", color: "from-green-500 to-teal-500" };
  if (percentageReturn > 0) return { emoji: "📈", vibe: "CLIMBING", color: "from-blue-400 to-cyan-500" };
  if (percentageReturn > -10) return { emoji: "😬", vibe: "HODLING", color: "from-yellow-400 to-orange-500" };
  if (percentageReturn > -20) return { emoji: "📉", vibe: "BLEEDING", color: "from-orange-500 to-red-500" };
  return { emoji: "💀", vibe: "REKT", color: "from-red-500 to-red-800" };
}

// Card types for the wrapped experience
type CardType = "intro" | "graph" | "month" | "stock" | "summary" | "share";

interface Card {
  type: CardType;
  data?: MonthlyData;
  stock?: PortfolioRow;
  index?: number;
}

export function PortfolioWrapped({ holdings, onClose }: WrappedProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = generateMonthlyData(holdings);
    setMonthlyData(data);

    // Build card sequence
    const cardSequence: Card[] = [
      { type: "intro" },
      { type: "graph" },
    ];

    // Add quarterly highlights (every 3 months)
    [2, 5, 8, 11].forEach((monthIndex) => {
      cardSequence.push({ type: "month", data: data[monthIndex], index: monthIndex });
    });

    // Add top 3 stock highlights
    const sortedHoldings = [...holdings].sort((a, b) => {
      const aReturn = ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100;
      const bReturn = ((b.currentPrice - b.purchasePrice) / b.purchasePrice) * 100;
      return bReturn - aReturn;
    });

    sortedHoldings.slice(0, 3).forEach((stock) => {
      cardSequence.push({ type: "stock", stock });
    });

    cardSequence.push({ type: "summary" });
    cardSequence.push({ type: "share" });

    setCards(cardSequence);
  }, [holdings]);

  const nextCard = () => {
    if (currentCard < cards.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setCurrentCard((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const prevCard = () => {
    if (currentCard > 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentCard((prev) => prev - 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const finalReturn = monthlyData[11]?.percentageReturn || 0;
  const totalValue = monthlyData[11]?.totalValue || 0;

  const renderCard = (card: Card) => {
    switch (card.type) {
      case "intro":
        return <IntroCard year={2024} />;
      case "graph":
        return <GraphCard monthlyData={monthlyData} />;
      case "month":
        return <MonthCard data={card.data!} index={card.index!} />;
      case "stock":
        return <StockCard stock={card.stock!} />;
      case "summary":
        return <SummaryCard monthlyData={monthlyData} holdings={holdings} />;
      case "share":
        return <ShareCard finalReturn={finalReturn} totalValue={totalValue} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Card container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden"
        onClick={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            if (x > rect.width / 2) {
              nextCard();
            } else {
              prevCard();
            }
          }
        }}
      >
        <div
          className={`w-full max-w-md transition-all duration-300 ${
            isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {cards[currentCard] && renderCard(cards[currentCard])}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-1.5 pb-6">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAnimating(true);
              setCurrentCard(i);
              setTimeout(() => setIsAnimating(false), 300);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentCard ? "bg-white w-6" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Tap hints */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-between px-8 text-white/30 text-xs pointer-events-none">
        <span>← Tap to go back</span>
        <span>Tap to continue →</span>
      </div>
    </div>
  );
}

// Individual card components

function IntroCard({ year }: { year: number }) {
  return (
    <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-center aspect-[9/16] flex flex-col justify-center items-center animate-fadeIn">
      <div className="text-6xl mb-4">📊</div>
      <h1 className="text-4xl font-bold text-white mb-2">Your</h1>
      <h1 className="text-5xl font-black text-white mb-2">Portfolio</h1>
      <h1 className="text-4xl font-bold text-white mb-6">Wrapped</h1>
      <div className="text-8xl font-black text-white/90">{year}</div>
      <p className="text-white/70 mt-8 text-sm">Tap to continue</p>
    </div>
  );
}

function GraphCard({ monthlyData }: { monthlyData: MonthlyData[] }) {
  const maxReturn = Math.max(...monthlyData.map((d) => d.percentageReturn), 10);
  const minReturn = Math.min(...monthlyData.map((d) => d.percentageReturn), -10);
  const range = maxReturn - minReturn;

  const getY = (value: number) => {
    return 100 - ((value - minReturn) / range) * 100;
  };

  const zeroY = getY(0);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 aspect-[9/16] flex flex-col animate-fadeIn">
      <h2 className="text-2xl font-bold text-white mb-2">Your Year in Numbers</h2>
      <p className="text-gray-400 text-sm mb-6">Monthly cumulative returns</p>

      <div className="flex-1 relative">
        {/* Zero line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-gray-600"
          style={{ top: `${zeroY}%` }}
        >
          <span className="absolute -left-1 -top-2.5 text-xs text-gray-500">0%</span>
        </div>

        {/* Graph bars */}
        <div className="absolute inset-0 flex items-end justify-between gap-1 pt-8 pb-8">
          {monthlyData.map((month, i) => {
            const isPositive = month.percentageReturn >= 0;
            const height = Math.abs(month.percentageReturn) / range * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center relative h-full">
                <div
                  className="absolute w-full flex flex-col items-center"
                  style={{
                    [isPositive ? "bottom" : "top"]: `${100 - zeroY}%`,
                  }}
                >
                  <div
                    className={`w-full rounded-sm transition-all duration-500 ${
                      isPositive
                        ? "bg-gradient-to-t from-green-600 to-green-400"
                        : "bg-gradient-to-b from-red-600 to-red-400"
                    }`}
                    style={{
                      height: `${height}%`,
                      minHeight: "4px",
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                <span className="absolute bottom-0 text-[10px] text-gray-500">{month.monthShort}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm">Year-end return</p>
        <p className={`text-4xl font-bold ${monthlyData[11]?.percentageReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
          {monthlyData[11]?.percentageReturn >= 0 ? "+" : ""}{monthlyData[11]?.percentageReturn}%
        </p>
      </div>
    </div>
  );
}

function MonthCard({ data, index }: { data: MonthlyData; index: number }) {
  const mood = getMonthMood(data.percentageReturn);
  const template = selectMemeTemplate(data.percentageReturn);
  const memeUrl = getMemeImageUrl(template);
  const topText = formatMemeText(template.topText, data.percentageReturn);
  const bottomText = formatMemeText(template.bottomText, data.percentageReturn);

  return (
    <div className={`bg-gradient-to-br ${mood.color} rounded-3xl p-6 aspect-[9/16] flex flex-col animate-fadeIn`}>
      <div className="text-center mb-4">
        <p className="text-white/70 text-sm uppercase tracking-wider">Q{Math.floor(index / 3) + 1} Highlight</p>
        <h2 className="text-3xl font-bold text-white">{data.month}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl mb-2">{mood.emoji}</div>
        <p className="text-2xl font-black text-white mb-4">{mood.vibe}</p>

        <div className={`text-5xl font-bold ${data.percentageReturn >= 0 ? "text-white" : "text-white"} mb-6`}>
          {data.percentageReturn >= 0 ? "+" : ""}{data.percentageReturn}%
        </div>

        {/* Mini meme preview */}
        <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-2xl">
          <img src={memeUrl} alt="Monthly meme" className="w-full h-full object-cover" />
          <div className="absolute top-1 left-0 right-0 text-center">
            <span className="text-white text-xs font-bold uppercase" style={{ textShadow: "1px 1px 2px black" }}>
              {topText.slice(0, 30)}
            </span>
          </div>
          <div className="absolute bottom-1 left-0 right-0 text-center">
            <span className="text-white text-xs font-bold uppercase" style={{ textShadow: "1px 1px 2px black" }}>
              {bottomText.slice(0, 30)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/60 text-xs">Top Performer</p>
          <p className="text-white font-bold">{data.topPerformer}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/60 text-xs">Needs Work</p>
          <p className="text-white font-bold">{data.worstPerformer}</p>
        </div>
      </div>
    </div>
  );
}

function StockCard({ stock }: { stock: PortfolioRow }) {
  const percentageReturn = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
  const totalGain = (stock.currentPrice - stock.purchasePrice) * stock.shares;
  const mood = getMonthMood(percentageReturn);
  const template = selectMemeTemplate(percentageReturn);
  const memeUrl = getMemeImageUrl(template);

  return (
    <div className={`bg-gradient-to-br ${mood.color} rounded-3xl p-6 aspect-[9/16] flex flex-col animate-fadeIn`}>
      <div className="text-center mb-4">
        <p className="text-white/70 text-sm uppercase tracking-wider">Stock Spotlight</p>
        <h2 className="text-4xl font-black text-white">{stock.ticker}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">{mood.emoji}</div>

        <div className={`text-5xl font-bold text-white mb-2`}>
          {percentageReturn >= 0 ? "+" : ""}{percentageReturn.toFixed(1)}%
        </div>

        <p className={`text-xl ${totalGain >= 0 ? "text-green-200" : "text-red-200"} mb-6`}>
          {totalGain >= 0 ? "+$" : "-$"}{Math.abs(totalGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>

        {/* Meme for this stock */}
        <div className="relative w-56 h-56 rounded-xl overflow-hidden shadow-2xl">
          <img src={memeUrl} alt={`${stock.ticker} meme`} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-0 right-0 text-center px-2">
            <span className="text-white text-sm font-bold uppercase" style={{ textShadow: "2px 2px 2px black" }}>
              Me buying {stock.ticker}
            </span>
          </div>
          <div className="absolute bottom-2 left-0 right-0 text-center px-2">
            <span className="text-white text-sm font-bold uppercase" style={{ textShadow: "2px 2px 2px black" }}>
              {percentageReturn >= 0 ? "Genius move" : "What was I thinking"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/60 text-xs">Bought at</p>
          <p className="text-white font-bold">${stock.purchasePrice.toFixed(2)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/60 text-xs">Now worth</p>
          <p className="text-white font-bold">${stock.currentPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ monthlyData, holdings }: { monthlyData: MonthlyData[]; holdings: PortfolioRow[] }) {
  const finalReturn = monthlyData[11]?.percentageReturn || 0;
  const mood = getMonthMood(finalReturn);

  // Count good vs bad months
  const goodMonths = monthlyData.filter((_, i) => {
    const prev = i > 0 ? monthlyData[i - 1].percentageReturn : 0;
    return monthlyData[i].percentageReturn > prev;
  }).length;

  // Find best and worst months
  let bestMonthIndex = 0;
  let worstMonthIndex = 0;
  let bestGain = -Infinity;
  let worstGain = Infinity;

  monthlyData.forEach((month, i) => {
    const prev = i > 0 ? monthlyData[i - 1].percentageReturn : 0;
    const gain = month.percentageReturn - prev;
    if (gain > bestGain) {
      bestGain = gain;
      bestMonthIndex = i;
    }
    if (gain < worstGain) {
      worstGain = gain;
      worstMonthIndex = i;
    }
  });

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-6 aspect-[9/16] flex flex-col animate-fadeIn">
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm uppercase tracking-wider">2024 Summary</p>
        <h2 className="text-3xl font-bold text-white">Your Year</h2>
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <p className="text-white/60 text-sm">Total Return</p>
          <p className={`text-4xl font-bold ${finalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
            {finalReturn >= 0 ? "+" : ""}{finalReturn}%
          </p>
          <p className="text-2xl mt-1">{mood.emoji} {mood.vibe}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-xs">Green Months</p>
            <p className="text-green-400 text-2xl font-bold">{goodMonths}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-xs">Red Months</p>
            <p className="text-red-400 text-2xl font-bold">{12 - goodMonths}</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white/60 text-xs text-center mb-2">Best Month</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-white font-bold">{MONTHS[bestMonthIndex]}</span>
            <span className="text-green-400 font-bold">+{bestGain.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-white/60 text-xs text-center mb-2">Worst Month</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">💀</span>
            <span className="text-white font-bold">{MONTHS[worstMonthIndex]}</span>
            <span className="text-red-400 font-bold">{worstGain.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/60 text-xs">Stocks Tracked</p>
          <p className="text-white text-2xl font-bold">{holdings.length}</p>
        </div>
      </div>
    </div>
  );
}

function ShareCard({ finalReturn, totalValue }: { finalReturn: number; totalValue: number }) {
  const mood = getMonthMood(finalReturn);

  const handleShare = (platform: "twitter" | "copy") => {
    const text = `My 2024 Portfolio Wrapped: ${finalReturn >= 0 ? "+" : ""}${finalReturn}% ${mood.emoji}\n\nGet your Portfolio Wrapped at portfoliomemer.app\n\n#PortfolioWrapped #WallStreetBets #Investing`;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className={`bg-gradient-to-br ${mood.color} rounded-3xl p-6 aspect-[9/16] flex flex-col items-center justify-center animate-fadeIn`}>
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{mood.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-2">That&apos;s a Wrap!</h2>
        <p className="text-white/70">Share your 2024 journey</p>
      </div>

      <div className="bg-white/10 rounded-xl p-6 mb-8 text-center">
        <p className="text-white/70 text-sm mb-1">Your 2024 Return</p>
        <p className="text-5xl font-black text-white">
          {finalReturn >= 0 ? "+" : ""}{finalReturn}%
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => handleShare("twitter")}
          className="w-full py-4 px-6 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
        >
          <span>𝕏</span> Share on Twitter
        </button>
        <button
          onClick={() => handleShare("copy")}
          className="w-full py-4 px-6 bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
        >
          📋 Copy to Clipboard
        </button>
      </div>

      <p className="text-white/50 text-xs mt-8 text-center">
        Made with portfoliomemer.app
      </p>
    </div>
  );
}
