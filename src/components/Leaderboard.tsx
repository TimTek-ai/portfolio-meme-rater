"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  id: string;
  percentageLoss: number;
  ticker?: string;
  timestamp: number;
  memeText?: string;
}

const STORAGE_KEY = "portfolioMemer_leaderboard";

function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveToLeaderboard(entry: Omit<LeaderboardEntry, "id" | "timestamp">): LeaderboardEntry {
  const leaderboard = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  // Keep only top 50 worst losses
  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => a.percentageLoss - b.percentageLoss);
  const trimmed = leaderboard.slice(0, 50);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return newEntry;
}

interface LeaderboardProps {
  currentReturn?: number;
  currentTicker?: string;
  currentMemeText?: string;
}

export function Leaderboard({ currentReturn, currentTicker, currentMemeText }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setEntries(getLeaderboard());
    // Check if current loss qualifies for leaderboard
    if (currentReturn !== undefined && currentReturn < -10) {
      setShowSubmit(true);
    }
  }, [currentReturn]);

  const handleSubmit = () => {
    if (currentReturn === undefined) return;

    saveToLeaderboard({
      percentageLoss: currentReturn,
      ticker: currentTicker,
      memeText: currentMemeText,
    });

    setEntries(getLeaderboard());
    setHasSubmitted(true);
    setShowSubmit(false);
  };

  const getRankEmoji = (index: number): string => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    if (index < 10) return "💀";
    return "📉";
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span>🏆</span> Hall of Shame
        </h3>
        <span className="text-xs text-gray-400">Biggest Losses</span>
      </div>

      {showSubmit && !hasSubmitted && currentReturn !== undefined && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse-border">
          <p className="text-sm text-red-400 mb-2">
            Your {currentReturn.toFixed(1)}% loss qualifies for the Hall of Shame! 💀
          </p>
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-all"
          >
            Submit My L 📉
          </button>
        </div>
      )}

      {hasSubmitted && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400">
            Your loss has been immortalized! Welcome to the club. 🎉💀
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">No losses submitted yet.</p>
          <p className="text-xs mt-1">Be the first to share your pain!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entries.slice(0, 10).map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-xl w-8 text-center">{getRankEmoji(index)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-400">
                    {entry.percentageLoss.toFixed(1)}%
                  </span>
                  {entry.ticker && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">
                      {entry.ticker}
                    </span>
                  )}
                </div>
                {entry.memeText && (
                  <p className="text-xs text-gray-400 truncate">{entry.memeText}</p>
                )}
              </div>
              <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        <p>Anonymous & stored locally only</p>
      </div>
    </div>
  );
}
