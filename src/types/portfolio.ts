export interface PortfolioRow {
  ticker: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  percentageReturn: number;
  holdings: HoldingSummary[];
}

export interface HoldingSummary {
  ticker: string;
  shares: number;
  invested: number;
  currentValue: number;
  gain: number;
  percentageGain: number;
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  minReturn: number;
  maxReturn: number;
  topText: string;
  bottomText: string;
}
