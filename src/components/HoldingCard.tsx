"use client";

import { useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { selectMemeTemplate, formatMemeText, getMemeImageUrl } from "@/lib/imgflip";
import { useToast } from "@/components/Toast";
import type { HoldingSummary } from "@/types/portfolio";

interface HoldingCardProps {
  holding: HoldingSummary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function HoldingCard({ holding }: HoldingCardProps) {
  const [showMeme, setShowMeme] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { showToast } = useToast();

  const template = selectMemeTemplate(holding.percentageGain);
  const topText = formatMemeText(template.topText, holding.percentageGain, holding.ticker);
  const bottomText = formatMemeText(template.bottomText, holding.percentageGain, holding.ticker);
  const imageUrl = getMemeImageUrl(template);

  const isPositive = holding.percentageGain >= 0;
  const color = isPositive ? "#4ade80" : "#f87171";

  const chartData = [
    { name: "Invested", value: holding.invested, color: "#6b7280" },
    { name: "Current", value: holding.currentValue, color },
  ];

  const handleShare = useCallback(async (platform: "twitter" | "copy") => {
    const text = `${holding.ticker}: ${isPositive ? "+" : ""}${holding.percentageGain.toFixed(1)}% ${isPositive ? "gains" : "loss"} - Generated with Portfolio Meme Rater`;

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!", "success");
    }
  }, [holding, isPositive, showToast]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{holding.ticker}</h3>
        <span
          className={`text-lg font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
        >
          {isPositive ? "+" : ""}{holding.percentageGain.toFixed(1)}%
        </span>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis type="category" dataKey="name" width={60} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Bar dataKey="value" radius={4}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>Invested: {formatCurrency(holding.invested)}</span>
        <span>Now: {formatCurrency(holding.currentValue)}</span>
      </div>

      {!showMeme ? (
        <button
          onClick={() => setShowMeme(true)}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          Show Meme
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative bg-black rounded overflow-hidden">
            {!imageLoaded && (
              <div className="aspect-square flex items-center justify-center text-gray-400 text-sm">
                Loading...
              </div>
            )}
            <img
              src={imageUrl}
              alt="Meme"
              className={`w-full ${imageLoaded ? "block" : "hidden"}`}
              onLoad={() => setImageLoaded(true)}
            />
            {imageLoaded && (
              <>
                <div className="absolute top-1 left-0 right-0 text-center px-1">
                  <span
                    className="text-white font-bold uppercase"
                    style={{
                      fontSize: "clamp(10px, 3.5vw, 18px)",
                      textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                      fontFamily: "Impact, sans-serif",
                    }}
                  >
                    {topText}
                  </span>
                </div>
                <div className="absolute bottom-1 left-0 right-0 text-center px-1">
                  <span
                    className="text-white font-bold uppercase"
                    style={{
                      fontSize: "clamp(10px, 3.5vw, 18px)",
                      textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                      fontFamily: "Impact, sans-serif",
                    }}
                  >
                    {bottomText}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleShare("twitter")}
              className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-700 rounded text-xs font-medium transition-colors"
            >
              Tweet
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="flex-1 py-1.5 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
