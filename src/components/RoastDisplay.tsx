"use client";

import { useState } from "react";

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
    catastrophic: "bg-red-900/50",
    terrible: "bg-red-800/50",
    bad: "bg-orange-800/50",
    meh: "bg-gray-700/50",
    decent: "bg-green-800/50",
    good: "bg-emerald-800/50",
    legendary: "bg-amber-700/50",
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
        className="py-2 px-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span> Generating...
          </>
        ) : (
          "Roast My Portfolio"
        )}
      </button>
    );
  }

  return (
    <div className={`rounded-lg p-3 ${tierColors[roast?.tier || "meh"]} border border-gray-600 animate-fadeIn`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{tierEmoji[roast?.tier || "meh"]}</span>
        <p className="text-sm text-gray-200 flex-1">
          &ldquo;{roast?.roast}&rdquo;
        </p>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={getNewRoast}
          disabled={loading}
          className="py-1 px-2 bg-gray-600/50 hover:bg-gray-500/50 rounded text-xs transition-colors disabled:opacity-50"
        >
          Another
        </button>
        <button
          onClick={() => {
            const text = `"${roast?.roast}" - My portfolio is ${percentageReturn >= 0 ? "up" : "down"} ${Math.abs(percentageReturn).toFixed(1)}%!`;
            navigator.clipboard.writeText(text);
          }}
          className="py-1 px-2 bg-gray-600/50 hover:bg-gray-500/50 rounded text-xs transition-colors"
        >
          Copy
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="py-1 px-2 bg-gray-600/50 hover:bg-gray-500/50 rounded text-xs transition-colors"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
