export type ImpactLevel = "HIGH" | "MED" | "LOW";

export interface DashboardNewsItem {
  id: string;
  lang: string;
  flag: string;
  source: string;
  headlineOriginal: string;
  headlineTranslated: string;
  commodity: string;
  sentiment: number;
  impact: ImpactLevel;
  time: string;
  url: string;
}

export interface DashboardSignal {
  commodity: string;
  direction: "LONG" | "SHORT";
  confidence: number;
  source: string;
  mu_adj: number;
  sigma_adj: number;
}

export interface MonteCarloSimulation {
  times: number[];
  paths: number[][];
  meanPath: number[];
  percentiles: {
    "5th": number[];
    "95th": number[];
  };
  actualPrice: number[];
  initialPrice: number;
  muFinal: number;
  sigmaFinal: number;
  numSimulations: number;
  asset: string;
}

export interface DashboardFormula {
  baseMu: number;
  baseSigma: number;
  muAdjustment: number;
  sigmaMultiplier: number;
}

export interface DashboardStats {
  signals: number;
  edge: string;
  mcPaths: number;
  languages: number;
  sources: number;
}

export interface DashboardExecutionOrder {
  id: string;
  commodity: string;
  asset: string;
  side: "BUY" | "SELL";
  orderType: "MKT" | "LMT";
  status: "QUEUED" | "ROUTED" | "FILLED" | "BLOCKED";
  confidence: number;
  sizePct: number;
  limitPrice: number;
  rationale: string;
}

export interface DashboardData {
  generatedAt: string;
  news: DashboardNewsItem[];
  signals: DashboardSignal[];
  execution: DashboardExecutionOrder[];
  simulation: MonteCarloSimulation;
  formula: DashboardFormula;
  stats: DashboardStats;
  warnings: string[];
}
