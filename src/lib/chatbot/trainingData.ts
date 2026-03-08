export interface ChatTrainingExample {
  id: string;
  tags: string[];
  user: string;
  assistant: string;
}

export const CHAT_TRAINING_EXAMPLES: ChatTrainingExample[] = [
  {
    id: "soy-br-drought",
    tags: ["soybeans", "brazil", "drought", "supply", "bearish"],
    user: "What does drought news in Brazil mean for soybeans?",
    assistant:
      "Conclusion: bias to LOWER LOW. Drought in a major producing region tightens supply and increases uncertainty; near-term downside risk in local production can raise volatility. Monitor export pace, weather revisions, and basis spreads.",
  },
  {
    id: "coffee-br-exports",
    tags: ["coffee", "brazil", "exports", "bullish", "higher high"],
    user: "Brazil posted record coffee exports. How should I read it?",
    assistant:
      "Conclusion: bias to HIGHER HIGH only if demand remains firm. Export strength confirms flow capacity, but persistent oversupply can cap upside. Check destination demand and inventory drawdowns before sizing long exposure.",
  },
  {
    id: "copper-cl-strike",
    tags: ["copper", "chile", "strike", "mine", "bullish"],
    user: "A Chile mining strike just escalated. Impact on copper?",
    assistant:
      "Conclusion: bias to HIGHER HIGH. Strike risk reduces expected near-term mine output, tightening refined supply expectations and widening upside tails. Validate with treatment charges and LME inventories.",
  },
  {
    id: "wheat-ru-export-restriction",
    tags: ["wheat", "russia", "export", "restriction", "bullish"],
    user: "Russia may tighten wheat export restrictions. What now?",
    assistant:
      "Conclusion: bias to HIGHER HIGH. Export friction from a major supplier can reprice global availability quickly. Watch Black Sea freight, tender results, and alternative origin substitution.",
  },
  {
    id: "natgas-us-storage",
    tags: ["natural gas", "us", "storage", "surplus", "bearish"],
    user: "US gas storage came in above seasonal norms. Signal?",
    assistant:
      "Conclusion: bias to LOWER LOW. Elevated storage weakens scarcity premium and can pressure front contracts. Confirm with weather revisions and LNG feedgas trends.",
  },
  {
    id: "semiconductor-jp-export-controls",
    tags: ["semiconductor", "japan", "export controls", "supply chain", "volatility"],
    user: "Japan discusses tighter chip export controls. How should we trade the signal?",
    assistant:
      "Conclusion: wider range with directional downside for exposed downstream names. Policy uncertainty raises volatility first; direction depends on implementation scope and exemptions.",
  },
  {
    id: "corn-us-weather-improves",
    tags: ["corn", "us", "weather", "yield", "bearish"],
    user: "US weather outlook improved for corn belt. What does this imply?",
    assistant:
      "Conclusion: bias to LOWER LOW. Better growing conditions lift yield expectations and reduce weather premium. Track weekly condition ratings and harvest pace.",
  },
  {
    id: "oil-middle-east-tension",
    tags: ["oil", "middle east", "geopolitics", "risk premium", "bullish"],
    user: "Geopolitical tensions are rising in the Middle East. Effect on crude?",
    assistant:
      "Conclusion: bias to HIGHER HIGH from risk premium repricing. Supply disruption probability widens upside tails; maintain scenario-based position sizing and hedge gap risk.",
  },
  {
    id: "gold-real-rates",
    tags: ["gold", "real rates", "usd", "macro"],
    user: "Real rates are rising while risk sentiment is stable. How does that affect gold?",
    assistant:
      "Conclusion: bias to LOWER LOW. Rising real yields increase opportunity cost of non-yielding assets. Validate with USD trend and ETF flows.",
  },
  {
    id: "lithium-ev-slowdown",
    tags: ["lithium", "ev", "demand", "slowdown", "bearish"],
    user: "EV demand growth is slowing. What does that suggest for lithium?",
    assistant:
      "Conclusion: bias to LOWER LOW. Demand deceleration plus recent supply additions can pressure spot and contract expectations. Check battery inventory and cathode order books.",
  },
  {
    id: "format-reference",
    tags: ["format", "response"],
    user: "How should the answer be structured?",
    assistant:
      "Use this structure: 1) Conclusion (HIGHER HIGH / LOWER LOW / BALANCED), 2) Why this signal matters, 3) What would invalidate it, 4) Sources with URLs.",
  },
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "what",
  "how",
  "from",
  "into",
  "over",
  "about",
  "just",
  "does",
  "mean",
  "now",
  "are",
  "your",
  "you",
  "have",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function scoreExample(queryTokens: string[], example: ChatTrainingExample): number {
  const exampleTokens = new Set([...tokenize(example.user), ...example.tags.map((tag) => tag.toLowerCase())]);
  let score = 0;

  for (const token of queryTokens) {
    if (exampleTokens.has(token)) {
      score += 2;
    }
    for (const tag of example.tags) {
      if (tag.toLowerCase().includes(token) || token.includes(tag.toLowerCase())) {
        score += 1;
      }
    }
  }

  return score;
}

export function buildFineTuneContext(userQuery: string, maxExamples = 4): string {
  const queryTokens = tokenize(userQuery);

  const ranked = CHAT_TRAINING_EXAMPLES
    .map((example) => ({ example, score: scoreExample(queryTokens, example) }))
    .sort((left, right) => right.score - left.score)
    .filter((entry) => entry.score > 0)
    .slice(0, maxExamples)
    .map((entry) => entry.example);

  if (ranked.length === 0) {
    ranked.push(CHAT_TRAINING_EXAMPLES.find((item) => item.id === "format-reference") as ChatTrainingExample);
  }

  const examplesText = ranked
    .map((item, index) => {
      return [
        `Example ${index + 1}:`,
        `User: ${item.user}`,
        `Assistant: ${item.assistant}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "Fine-tune behavior (in-context training):",
    "- Follow the answer style and market logic demonstrated below.",
    "- Prefer explicit directional conclusion (HIGHER HIGH / LOWER LOW / BALANCED).",
    "- Explain mechanism (supply, demand, policy, or volatility regime) briefly.",
    "- Include invalidation conditions and source URLs.",
    examplesText,
  ].join("\n\n");
}
