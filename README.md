# AI Hedge Fund Dashboard

Unified dashboard that integrates:

- `news_scraper` flow (CrustData `web-search` + `web-fetch`)
- `gemma-translation` flow (Google Generative API translation)
- `monte-carlo` flow (GBM simulation with sentiment-adjusted drift/volatility)

## Tools & APIs Used

- CrustData API (news discovery via `web-search` and `web-fetch`)
- ShisaAI (Japanese/local-language analysis workflow)
- Google Generative AI API (Gemma translation and multilingual processing)
- OpenAI API (chat/agent extensions)
- Gemma models (default: `gemma-3-27b-it`)

## Live Vercel Links

- Landing Page: https://ai-hedge-fund-one.vercel.app/
- Dashboard: https://ai-hedge-fund-one.vercel.app/dashboard
- Geospatial Intelligence: https://verceldeploy-eight-iota.vercel.app/
- FPGA / LLVM Pipeline: https://laplace-fpga-llvm.vercel.app/

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

## Environment Variables

Create `.env.local` in this repo:

```bash
CRUSTDATA_TOKEN=your_crustdata_token
GOOGLE_API_KEY=your_google_ai_studio_key

# Optional tuning
GEMMA_MODEL=gemma-3-27b-it
OPENAI_API_KEY=your_openai_api_key
SHISA_API_KEY=your_shisaai_api_key
DASHBOARD_NEWS_QUERY=soybeans drought export strike copper mining
DASHBOARD_GEOLOCATION=BR
DASHBOARD_NEWS_LIMIT=8
DASHBOARD_TARGET_LANGUAGE=English
```

If keys are missing or an API call fails, the dashboard automatically falls back to mock data and shows a degraded status.

## API

- `GET /api/dashboard`
  - Returns aggregated news, translated headlines, trading signals, Monte Carlo output, stats, and warnings in one payload.

## Notes

- The external `monte-carlo` repo currently misses `backend/engine/monte_carlo.py`; this dashboard includes a compatible TypeScript Monte Carlo engine implementation.
