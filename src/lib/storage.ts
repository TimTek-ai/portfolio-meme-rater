import type { PortfolioRow } from "@/types/portfolio";

const STORAGE_KEY = "portfolio-meme-rater-portfolios";

export interface SavedPortfolio {
  id: string;
  name: string;
  holdings: PortfolioRow[];
  createdAt: number;
  updatedAt: number;
}

export function getSavedPortfolios(): SavedPortfolio[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePortfolio(name: string, holdings: PortfolioRow[]): SavedPortfolio {
  const portfolios = getSavedPortfolios();
  const now = Date.now();

  const newPortfolio: SavedPortfolio = {
    id: `portfolio-${now}`,
    name,
    holdings,
    createdAt: now,
    updatedAt: now,
  };

  portfolios.unshift(newPortfolio);

  // Keep only last 10 portfolios
  const trimmed = portfolios.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

  return newPortfolio;
}

export function updatePortfolio(id: string, holdings: PortfolioRow[]): void {
  const portfolios = getSavedPortfolios();
  const index = portfolios.findIndex((p) => p.id === id);

  if (index !== -1) {
    portfolios[index].holdings = holdings;
    portfolios[index].updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
  }
}

export function deletePortfolio(id: string): void {
  const portfolios = getSavedPortfolios();
  const filtered = portfolios.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
