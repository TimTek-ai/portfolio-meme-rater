"use client";

import { useState, useEffect } from "react";

interface RoastDisplayProps {
  percentageReturn: number;
  ticker?: string;
}

interface RoastResponse {
  roast: string;
  tier: string;
}

export function RoastDisplay({ percentageReturn, ticker }: RoastDisplayProps) {
  const [roast, setRoast] = useState<RoastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fetchRoast = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        return: percentageReturn.toString(),
        ...(ticker && { ticker }),
      });
      const res = await fetch(`/api/roast?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRoast(data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Failed to fetch roast:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNewRoast = () => {
    fetchRoast();
  };

  const tierColors: Record<string, string> = {
    catastrophic: "from-red-600 to-red-800",
    terrible: "from-red-500 to-orange-600",
    bad: "from-orange-500 to-yellow-600",
    meh: "from-gray-500 to-gray-600",
    decent: "from-green-500 to-emerald-600",
    good: "from-emerald-500 to-teal-600",
    legendary: "from-yellow-400 to-amber-500",
  };

  const tierEmoji: Record<string, string> = {
    catastrophic: "💀",
    terrible: "😭",
    bad: "😬",
    meh: "😐",
    decent: "😊",
    good: "🎉",
    legendary: "🚀",
  };

  if (!isVisible) {
    return (
      <button
        onClick={fetchRoast}
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span> Generating roast...
          </>
        ) : (
          <>
            🔥 Roast My Portfolio
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-r ${tierColors[roast?.tier || "meh"]} animate-fadeIn`}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{tierEmoji[roast?.tier || "meh"]}</span>
          <span className="text-xs uppercase tracking-wider opacity-80">AI Roast</span>
        </div>
        <p className="text-white font-medium text-lg leading-relaxed">
          &ldquo;{roast?.roast}&rdquo;
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={getNewRoast}
            disabled={loading}
            className="py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all disabled:opacity-50"
          >
            🎲 Another Roast
          </button>
          <button
            onClick={() => {
              const text = `"${roast?.roast}" - My portfolio is ${percentageReturn >= 0 ? "up" : "down"} ${Math.abs(percentageReturn).toFixed(1)}%! 🔥\n\nGet roasted at portfoliomemer.app #WallStreetBets #Roasted`;
              navigator.clipboard.writeText(text);
            }}
            className="py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all"
          >
            📋 Copy
          </button>
          <button
            onClick={() => {
              const text = `"${roast?.roast}" - My portfolio is ${percentageReturn >= 0 ? "up" : "down"} ${Math.abs(percentageReturn).toFixed(1)}%! 🔥\n\nGet roasted at portfoliomemer.app #WallStreetBets #Roasted`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all"
          >
            𝕏 Tweet
          </button>
        </div>
      </div>
    </div>
  );
}
