"use client";

import { useState, useEffect } from "react";
import { getSavedPortfolios, deletePortfolio, type SavedPortfolio } from "@/lib/storage";
import type { PortfolioRow } from "@/types/portfolio";

interface SavedPortfoliosProps {
  onLoad: (holdings: PortfolioRow[]) => void;
}

export function SavedPortfolios({ onLoad }: SavedPortfoliosProps) {
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPortfolios(getSavedPortfolios());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePortfolio(id);
    setPortfolios(getSavedPortfolios());
  };

  const handleLoad = (portfolio: SavedPortfolio) => {
    onLoad(portfolio.holdings);
    setIsOpen(false);
  };

  if (portfolios.length === 0) return null;

  return (
    <div className="animate-fadeIn">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all flex items-center justify-between"
      >
        <span>Load Saved Portfolio</span>
        <span className="text-gray-400 text-sm">{portfolios.length} saved</span>
      </button>

      {isOpen && (
        <div className="mt-2 bg-gray-800 rounded-lg overflow-hidden animate-slideDown">
          {portfolios.map((portfolio, index) => (
            <button
              key={portfolio.id}
              onClick={() => handleLoad(portfolio)}
              className="w-full p-3 hover:bg-gray-700 transition-all flex items-center justify-between border-b border-gray-700 last:border-0 animate-slideIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-left">
                <p className="font-medium">{portfolio.name}</p>
                <p className="text-xs text-gray-400">
                  {portfolio.holdings.length} holdings · {new Date(portfolio.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(portfolio.id, e)}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
