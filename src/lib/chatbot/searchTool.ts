const CRUSTDATA_BASE_URL = "https://api.crustdata.com";

const VALID_GEOLOCATIONS = new Set([
  "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE", "VE",
  "GB", "DE", "FR", "IT", "ES", "PT", "NL", "BE", "CH", "AT", "PL",
  "SE", "NO", "DK", "FI", "IE", "RU", "UA", "CZ", "GR", "TR", "RO", "HU",
  "JP", "CN", "KR", "IN", "ID", "TH", "VN", "MY", "SG", "PH", "TW", "HK",
  "SA", "AE", "IL", "EG", "AU", "NZ", "ZA", "NG", "KE",
]);

interface SearchParams {
  apiKey: string;
  query: string;
  geolocation?: string;
  fetchContent?: boolean;
}

export async function commodityWebSearch(params: SearchParams): Promise<unknown> {
  const { apiKey, query, geolocation, fetchContent = false } = params;
  const searchUrl = `${CRUSTDATA_BASE_URL}/screener/web-search${fetchContent ? "?fetch_content=true" : ""}`;

  const payload: Record<string, unknown> = {
    query: query.slice(0, 1000),
    sources: ["web", "news"],
  };

  const normalizedGeo = geolocation?.toUpperCase();
  if (normalizedGeo && VALID_GEOLOCATIONS.has(normalizedGeo)) {
    payload.geolocation = normalizedGeo;
  }

  const response = await fetch(searchUrl, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CrustData search failed (${response.status}): ${body.slice(0, 180)}`);
  }

  return response.json();
}
