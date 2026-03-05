export type MarketRow = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
};

export type PortfolioItem = {
  id: number;
  coinId: string;
  amount: number;
  buyPrice: number;
};
