import type { PortfolioRow, PortfolioSummary, HoldingSummary } from "@/types/portfolio";

export function calculatePortfolioSummary(rows: PortfolioRow[]): PortfolioSummary {
  const holdings: HoldingSummary[] = rows.map((row) => {
    const invested = row.shares * row.purchasePrice;
    const currentValue = row.shares * row.currentPrice;
    const gain = currentValue - invested;
    const percentageGain = invested > 0 ? (gain / invested) * 100 : 0;

    return {
      ticker: row.ticker,
      shares: row.shares,
      invested,
      currentValue,
      gain,
      percentageGain,
    };
  });

  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalReturn = currentValue - totalInvested;
  const percentageReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalReturn,
    percentageReturn,
    holdings,
  };
}

export function parsePortfolioCsv(
  data: Record<string, string>[]
): PortfolioRow[] {
  return data
    .map((row) => {
      const ticker = row.ticker || row.Ticker || row.symbol || row.Symbol || "";
      const shares = parseFloat(row.shares || row.Shares || row.quantity || row.Quantity || "0");
      const purchasePrice = parseFloat(
        row.purchasePrice || row.PurchasePrice || row.purchase_price || row.cost || row.Cost || "0"
      );
      const currentPrice = parseFloat(
        row.currentPrice || row.CurrentPrice || row.current_price || row.price || row.Price || "0"
      );

      return { ticker, shares, purchasePrice, currentPrice };
    })
    .filter((row) => row.ticker && row.shares > 0);
}
