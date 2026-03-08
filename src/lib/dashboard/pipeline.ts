import { runMonteCarloSimulation } from "@/lib/dashboard/monteCarlo";
import { createMockDashboardData } from "@/lib/dashboard/mock";
import type {
  DashboardData,
  DashboardExecutionOrder,
  DashboardNewsItem,
  DashboardSignal,
  ImpactLevel,
  MonteCarloSimulation,
} from "@/lib/dashboard/types";

interface SearchResult {
  url?: string;
  title?: string;
  source?: string | { name?: string };
  language?: string;
  lang?: string;
  publishedAt?: string;
  published_at?: string;
  snippet?: string;
  description?: string;
}

interface FetchResult {
  url?: string;
  content?: string;
  pageTitle?: string;
  success?: boolean;
}

const COMMODITY_KEYWORDS: Record<string, string[]> = {
  Soybeans: ["soy", "soybean", "soja"],
  Corn: ["corn", "maize"],
  Wheat: ["wheat"],
  Coffee: ["coffee", "cafe"],
  Sugar: ["sugar", "cane"],
  Copper: ["copper"],
  Lithium: ["lithium", "battery", "ev"],
  Semiconductors: ["chip", "semiconductor", "export control"],
  Oil: ["oil", "brent", "wti", "crude"],
  Gas: ["gas", "lng"],
};

const POSITIVE_WORDS = [
  "record",
  "surge",
  "growth",
  "increase",
  "boost",
  "strong",
  "recovery",
  "approval",
  "expand",
  "up",
  "gain",
  "improve",
  "eases",
  "abundant",
  "stable",
];

const NEGATIVE_WORDS = [
  "drought",
  "strike",
  "decline",
  "drop",
  "fall",
  "shortage",
  "ban",
  "conflict",
  "war",
  "sanction",
  "cut",
  "flood",
  "disease",
  "damage",
  "disruption",
  "risk",
  "tightens",
  "down",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function decodeHtml(text: string): string {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function htmlToText(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractSourceName(source: SearchResult["source"], url: string): string {
  if (typeof source === "string" && source.trim().length > 0) {
    return source.trim();
  }
  if (source && typeof source === "object" && typeof source.name === "string" && source.name.trim().length > 0) {
    return source.name.trim();
  }

  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown Source";
  }
}

function mapLangCode(input?: string): { lang: string; flag: string } {
  const normalized = (input ?? "").toLowerCase();

  if (normalized.startsWith("pt") || normalized.includes("brazil")) {
    return { lang: "PT-BR", flag: "🇧🇷" };
  }
  if (normalized.startsWith("ja") || normalized.includes("japan")) {
    return { lang: "JA", flag: "🇯🇵" };
  }
  if (normalized.startsWith("es") || normalized.includes("chile") || normalized.includes("span")) {
    return { lang: "ES", flag: "🇨🇱" };
  }
  if (normalized.startsWith("fr")) {
    return { lang: "FR", flag: "🇫🇷" };
  }
  if (normalized.startsWith("de")) {
    return { lang: "DE", flag: "🇩🇪" };
  }
  if (normalized.startsWith("zh")) {
    return { lang: "ZH", flag: "🇨🇳" };
  }

  return { lang: "EN", flag: "🇺🇸" };
}

function formatRelativeTime(publishedAt: string | undefined, index: number): string {
  if (!publishedAt) {
    return `${2 + index * 6}m`;
  }

  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) {
    return `${2 + index * 6}m`;
  }

  const deltaMs = Date.now() - parsed.getTime();
  const minutes = Math.max(1, Math.floor(deltaMs / 60000));
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function inferCommodity(text: string): string {
  const normalized = text.toLowerCase();

  for (const [commodity, keywords] of Object.entries(COMMODITY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return commodity;
    }
  }

  return "Macro Basket";
}

function scoreSentiment(text: string): number {
  const normalized = text.toLowerCase();

  let positive = 0;
  let negative = 0;

  for (const word of POSITIVE_WORDS) {
    if (normalized.includes(word)) {
      positive += 1;
    }
  }
  for (const word of NEGATIVE_WORDS) {
    if (normalized.includes(word)) {
      negative += 1;
    }
  }

  if (positive === 0 && negative === 0) {
    return 0;
  }

  return clamp((positive - negative) / (positive + negative + 1), -0.95, 0.95);
}

function classifyImpact(sentiment: number): ImpactLevel {
  const magnitude = Math.abs(sentiment);
  if (magnitude >= 0.65) {
    return "HIGH";
  }
  if (magnitude >= 0.35) {
    return "MED";
  }
  return "LOW";
}

function extractTextSnippet(rawText: string): string {
  if (rawText.length <= 180) {
    return rawText;
  }
  return `${rawText.slice(0, 180)}...`;
}

async function postJson<T>(
  url: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${responseText.slice(0, 220)}`);
  }

  return (await response.json()) as T;
}

function unwrapGeminiResponse(raw: unknown): string {
  if (!raw || typeof raw !== "object") {
    return "";
  }

  const data = raw as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    return "";
  }

  return parts
    .map((part) => part.text ?? "")
    .join("\n")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

async function translateWithGemma(
  originals: string[],
  targetLanguage: string,
  warnings: string[],
): Promise<string[]> {
  const apiKey =
    process.env.GOOGLE_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.GEMMA_API_KEY ??
    "";

  if (!apiKey) {
    warnings.push("GOOGLE_API_KEY is not configured. Showing original headlines.");
    return originals;
  }

  const models = [
    process.env.GEMMA_MODEL ?? "gemma-3-27b-it",
    "gemini-2.0-flash",
  ];

  const prompt = [
    "Translate each string to the target language.",
    `Target language: ${targetLanguage}`,
    "Return only valid JSON in this shape:",
    '{"translations":["...","..."]}',
    "The translations array length must match the input length exactly.",
    `Input JSON: ${JSON.stringify({ headlines: originals })}`,
  ].join("\n");

  for (const model of models) {
    try {
      const raw = await postJson<unknown>(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        },
        { "Content-Type": "application/json" },
      );

      const text = unwrapGeminiResponse(raw);
      if (!text) {
        throw new Error("Model returned no text.");
      }

      const parsed = JSON.parse(text) as { translations?: string[] };
      if (!Array.isArray(parsed.translations) || parsed.translations.length !== originals.length) {
        throw new Error("Model response did not match requested output length.");
      }

      return parsed.translations.map((line, index) => {
        const trimmed = line.trim();
        return trimmed.length > 0 ? trimmed : originals[index];
      });
    } catch {
      // Try the next model candidate.
    }
  }

  warnings.push("Gemma translation request failed. Showing original headlines.");
  return originals;
}

async function fetchCrustNews(warnings: string[]): Promise<DashboardNewsItem[]> {
  const token = process.env.CRUSTDATA_TOKEN ?? "";
  if (!token) {
    warnings.push("CRUSTDATA_TOKEN is not configured. Using fallback feed.");
    return [];
  }

  const query = process.env.DASHBOARD_NEWS_QUERY ?? "soybeans drought export strike copper mining";
  const geolocation = process.env.DASHBOARD_GEOLOCATION ?? "BR";
  const maxItems = clamp(Number(process.env.DASHBOARD_NEWS_LIMIT ?? "8"), 4, 20);

  let searchResults: SearchResult[] = [];

  try {
    const searchData = await postJson<{ results?: SearchResult[] }>(
      "https://api.crustdata.com/screener/web-search",
      {
        query,
        geolocation,
        sources: ["news", "web"],
      },
      {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    );

    searchResults = Array.isArray(searchData.results) ? searchData.results : [];
  } catch (error) {
    warnings.push(`CrustData web-search failed: ${(error as Error).message}`);
    return [];
  }

  const ranked = searchResults
    .filter((result): result is SearchResult & { url: string } => typeof result.url === "string")
    .slice(0, maxItems);

  if (ranked.length === 0) {
    warnings.push("CrustData returned no search results.");
    return [];
  }

  let fetchResults: FetchResult[] = [];
  try {
    fetchResults = await postJson<FetchResult[]>(
      "https://api.crustdata.com/screener/web-fetch",
      {
        urls: ranked.map((result) => result.url),
      },
      {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    );
  } catch (error) {
    warnings.push(`CrustData web-fetch failed: ${(error as Error).message}`);
  }

  const fetchedByUrl = new Map<string, FetchResult>();
  for (const item of fetchResults) {
    if (typeof item.url === "string") {
      fetchedByUrl.set(item.url, item);
    }
  }

  const originals: string[] = [];
  const enriched = ranked.map((result) => {
    const page = fetchedByUrl.get(result.url);
    const pageText = page?.content ? htmlToText(page.content) : "";

    const originalHeadline =
      result.title?.trim() ||
      page?.pageTitle?.trim() ||
      extractTextSnippet(result.snippet ?? result.description ?? pageText) ||
      result.url;

    originals.push(originalHeadline);

    return {
      result,
      pageText,
      originalHeadline,
    };
  });

  const translated = await translateWithGemma(
    originals,
    process.env.DASHBOARD_TARGET_LANGUAGE ?? "English",
    warnings,
  );

  return enriched.map((item, index) => {
    const translatedHeadline = translated[index];
    const source = extractSourceName(item.result.source, item.result.url);
    const commodity = inferCommodity(`${translatedHeadline} ${item.pageText}`);
    const sentiment = scoreSentiment(`${translatedHeadline} ${item.pageText}`);
    const publishedAt = item.result.publishedAt ?? item.result.published_at;
    const langMeta = mapLangCode(item.result.language ?? item.result.lang);

    return {
      id: `news-${index}-${Buffer.from(item.result.url).toString("base64url").slice(0, 8)}`,
      lang: langMeta.lang,
      flag: langMeta.flag,
      source,
      headlineOriginal: item.originalHeadline,
      headlineTranslated: translatedHeadline,
      commodity,
      sentiment,
      impact: classifyImpact(sentiment),
      time: formatRelativeTime(publishedAt, index),
      url: item.result.url,
    };
  });
}

function signalsFromNews(news: DashboardNewsItem[]): DashboardSignal[] {
  const bestByCommodity = new Map<string, DashboardSignal>();

  for (const item of news) {
    const confidence = clamp(0.5 + Math.abs(item.sentiment) * 0.5, 0.5, 0.95);
    const signal: DashboardSignal = {
      commodity: item.commodity,
      direction: item.sentiment >= 0 ? "LONG" : "SHORT",
      confidence,
      source: item.source,
      mu_adj: item.sentiment * 0.05,
      sigma_adj: 1 + Math.abs(item.sentiment) * 0.1,
    };

    const current = bestByCommodity.get(item.commodity);
    if (!current || signal.confidence > current.confidence) {
      bestByCommodity.set(item.commodity, signal);
    }
  }

  return [...bestByCommodity.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4);
}

function weightedSentiment(signals: DashboardSignal[]): number {
  if (signals.length === 0) {
    return 0;
  }

  const numerator = signals.reduce((sum, signal) => {
    const signed = signal.direction === "LONG" ? signal.confidence : -signal.confidence;
    return sum + signed;
  }, 0);

  return numerator / signals.length;
}

function inferAsset(signals: DashboardSignal[]): string {
  const top = signals[0]?.commodity.toLowerCase() ?? "soybeans";
  if (top.includes("soy")) {
    return "SOY";
  }
  if (top.includes("corn")) {
    return "CORN";
  }
  if (top.includes("wheat")) {
    return "WHEAT";
  }
  if (top.includes("copper")) {
    return "HG";
  }
  return "SOY";
}

function baseParamsForAsset(asset: string): { initialPrice: number; baseMu: number; baseSigma: number } {
  if (asset === "CORN") {
    return { initialPrice: 450, baseMu: 0.03, baseSigma: 0.15 };
  }
  if (asset === "WHEAT") {
    return { initialPrice: 620, baseMu: 0.035, baseSigma: 0.16 };
  }
  if (asset === "HG") {
    return { initialPrice: 900, baseMu: 0.045, baseSigma: 0.22 };
  }
  return { initialPrice: 1200, baseMu: 0.04, baseSigma: 0.18 };
}

function executionFromSignals(
  signals: DashboardSignal[],
  simulation: MonteCarloSimulation,
): DashboardExecutionOrder[] {
  const referencePrice = simulation.actualPrice.at(-1) ?? simulation.initialPrice;
  const projectedMean = simulation.meanPath.at(-1) ?? referencePrice;

  return signals.map((signal, index) => {
    const side = signal.direction === "LONG" ? "BUY" : "SELL";
    const confidence = clamp(signal.confidence, 0, 1);
    const sizePct = Number(clamp(confidence * 12, 2, 15).toFixed(2));
    const orderType = confidence >= 0.75 ? "MKT" : "LMT";
    const status =
      confidence >= 0.85 ? "FILLED" : confidence >= 0.65 ? "ROUTED" : confidence >= 0.55 ? "QUEUED" : "BLOCKED";

    const directionalBias = side === "BUY" ? 1 : -1;
    const move = Math.abs(projectedMean - referencePrice) / Math.max(referencePrice, 1e-6);
    const limitOffset = clamp(move * 0.5 + Math.abs(signal.mu_adj) * 0.3, 0.002, 0.03);
    const limitPrice = Number(
      (referencePrice * (1 + directionalBias * (orderType === "LMT" ? -limitOffset : 0))).toFixed(2),
    );

    return {
      id: `exec-${Date.now()}-${index + 1}`,
      commodity: signal.commodity,
      asset: simulation.asset,
      side,
      orderType,
      status,
      confidence,
      sizePct,
      limitPrice,
      rationale: `AI ${signal.direction} signal from ${signal.source} translated into ${side} execution intent.`,
    };
  });
}

export async function buildDashboardData(): Promise<DashboardData> {
  const warnings: string[] = [];

  try {
    const news = await fetchCrustNews(warnings);

    if (news.length === 0) {
      return createMockDashboardData(warnings);
    }

    const signals = signalsFromNews(news);
    if (signals.length === 0) {
      return createMockDashboardData([...warnings, "No directional signal found from fetched news."]);
    }

    const aggregateSentiment = weightedSentiment(signals);
    const muAdjustment = aggregateSentiment * 0.05;
    const sigmaMultiplier = 1 + Math.abs(aggregateSentiment) * 0.1;

    const asset = inferAsset(signals);
    const { initialPrice, baseMu, baseSigma } = baseParamsForAsset(asset);

    const simulation = runMonteCarloSimulation({
      initialPrice,
      mu: baseMu,
      sigma: baseSigma,
      muAdjustment,
      sigmaMultiplier,
      timeHorizonYears: 0.25,
      numSimulations: 1200,
      sampledPaths: 70,
      asset,
      eventSentiment: aggregateSentiment,
    });
    const execution = executionFromSignals(signals, simulation);

    return {
      generatedAt: new Date().toISOString(),
      news,
      signals,
      execution,
      simulation,
      formula: {
        baseMu,
        baseSigma,
        muAdjustment,
        sigmaMultiplier,
      },
      stats: {
        signals: signals.length,
        edge: "3-8h",
        mcPaths: simulation.numSimulations,
        languages: new Set(news.map((item) => item.lang)).size,
        sources: new Set(news.map((item) => item.source)).size,
      },
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return createMockDashboardData([`Pipeline failed and switched to fallback: ${message}`]);
  }
}
