import { runMonteCarloSimulation } from "@/lib/dashboard/monteCarlo";
import type { DashboardData, DashboardExecutionOrder, DashboardNewsItem, DashboardSignal } from "@/lib/dashboard/types";

const mockNews: DashboardNewsItem[] = [
  {
    id: "mock-1",
    lang: "PT-BR",
    flag: "🇧🇷",
    source: "Folha de S.Paulo",
    headlineOriginal: "Seca severa atinge plantações de soja no Mato Grosso",
    headlineTranslated: "Severe drought hits soybean plantations in Mato Grosso",
    commodity: "Soybeans",
    sentiment: -0.82,
    impact: "HIGH",
    time: "2m",
    url: "https://example.com/mock/1",
  },
  {
    id: "mock-2",
    lang: "JA",
    flag: "🇯🇵",
    source: "日本経済新聞",
    headlineOriginal: "半導体輸出規制の強化を検討、経産省が発表",
    headlineTranslated: "Government considers stricter semiconductor export controls",
    commodity: "Semiconductors",
    sentiment: -0.65,
    impact: "HIGH",
    time: "8m",
    url: "https://example.com/mock/2",
  },
  {
    id: "mock-3",
    lang: "ES",
    flag: "🇨🇱",
    source: "El Mercurio",
    headlineOriginal: "Producción de cobre cae un 12% por huelga minera",
    headlineTranslated: "Copper production falls 12% due to mining strike",
    commodity: "Copper",
    sentiment: -0.71,
    impact: "MED",
    time: "15m",
    url: "https://example.com/mock/3",
  },
  {
    id: "mock-4",
    lang: "PT-BR",
    flag: "🇧🇷",
    source: "Valor Econômico",
    headlineOriginal: "Exportações de café atingem recorde em fevereiro",
    headlineTranslated: "Coffee exports reach a record in February",
    commodity: "Coffee",
    sentiment: 0.58,
    impact: "MED",
    time: "23m",
    url: "https://example.com/mock/4",
  },
  {
    id: "mock-5",
    lang: "JA",
    flag: "🇯🇵",
    source: "NHK",
    headlineOriginal: "トヨタ、新型EV電池の量産開始を前倒し",
    headlineTranslated: "Toyota moves up mass production start for next-gen EV battery",
    commodity: "Lithium",
    sentiment: 0.45,
    impact: "LOW",
    time: "31m",
    url: "https://example.com/mock/5",
  },
  {
    id: "mock-6",
    lang: "PT-BR",
    flag: "🇧🇷",
    source: "G1 Agro",
    headlineOriginal: "Geada inesperada causa prejuízo em plantações de cana",
    headlineTranslated: "Unexpected frost damages sugar cane plantations",
    commodity: "Sugar",
    sentiment: -0.55,
    impact: "MED",
    time: "42m",
    url: "https://example.com/mock/6",
  },
];

const mockSignals: DashboardSignal[] = [
  {
    commodity: "Soybeans (ZS)",
    direction: "SHORT",
    confidence: 0.87,
    source: "BR drought news",
    mu_adj: -0.12,
    sigma_adj: 0.35,
  },
  {
    commodity: "Copper (HG)",
    direction: "SHORT",
    confidence: 0.72,
    source: "CL mining strike",
    mu_adj: -0.08,
    sigma_adj: 0.28,
  },
  {
    commodity: "Semiconductors",
    direction: "SHORT",
    confidence: 0.65,
    source: "JP export regulation",
    mu_adj: -0.06,
    sigma_adj: 0.22,
  },
  {
    commodity: "Coffee (KC)",
    direction: "LONG",
    confidence: 0.58,
    source: "BR export record",
    mu_adj: 0.05,
    sigma_adj: 0.18,
  },
];

function mockExecutionFromSignals(signals: DashboardSignal[], initialPrice: number): DashboardExecutionOrder[] {
  return signals.map((signal, index) => {
    const side = signal.direction === "LONG" ? "BUY" : "SELL";
    const orderType = signal.confidence > 0.75 ? "MKT" : "LMT";
    const status =
      signal.confidence >= 0.82 ? "FILLED" : signal.confidence >= 0.68 ? "ROUTED" : "QUEUED";
    const sizePct = Math.min(15, Math.max(2, Number((signal.confidence * 12).toFixed(2))));
    const limitPrice =
      side === "BUY"
        ? Number((initialPrice * (1 - Math.abs(signal.mu_adj) * 0.25)).toFixed(2))
        : Number((initialPrice * (1 + Math.abs(signal.mu_adj) * 0.25)).toFixed(2));

    return {
      id: `exec-mock-${index + 1}`,
      commodity: signal.commodity,
      asset: signal.commodity.includes("Copper") ? "HG" : "SOY",
      side,
      orderType,
      status,
      confidence: signal.confidence,
      sizePct,
      limitPrice,
      rationale: `Derived from AI signal (${signal.source}) with ${(signal.confidence * 100).toFixed(0)}% confidence.`,
    };
  });
}

export function createMockDashboardData(warnings: string[] = []): DashboardData {
  const weightedSentiment =
    mockSignals.reduce(
      (sum, signal) =>
        sum + (signal.direction === "LONG" ? signal.confidence : -signal.confidence),
      0,
    ) / mockSignals.length;

  const muAdjustment = weightedSentiment * 0.05;
  const sigmaMultiplier = 1 + Math.abs(weightedSentiment) * 0.1;
  const initialPrice = 1200;
  const execution = mockExecutionFromSignals(mockSignals, initialPrice);

  return {
    generatedAt: new Date().toISOString(),
    news: mockNews,
    signals: mockSignals,
    simulation: runMonteCarloSimulation({
      initialPrice,
      mu: 0.04,
      sigma: 0.18,
      muAdjustment,
      sigmaMultiplier,
      numSimulations: 1000,
      sampledPaths: 60,
      asset: "SOY",
      eventSentiment: weightedSentiment,
    }),
    formula: {
      baseMu: 0.04,
      baseSigma: 0.18,
      muAdjustment,
      sigmaMultiplier,
    },
    execution,
    stats: {
      signals: mockSignals.length,
      edge: "3-8h",
      mcPaths: 1000,
      languages: new Set(mockNews.map((item) => item.lang)).size,
      sources: new Set(mockNews.map((item) => item.source)).size,
    },
    warnings,
  };
}
