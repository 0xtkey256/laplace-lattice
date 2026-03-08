"use client";

import type { DashboardNewsItem } from "@/lib/dashboard/types";

interface NewsFeedProps {
  items: DashboardNewsItem[];
  loading: boolean;
  error: string | null;
}

export default function NewsFeed({ items, loading, error }: NewsFeedProps) {
  if (loading && items.length === 0) {
    return (
      <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 400 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] animate-pulse"
          >
            <div className="h-3 w-2/3 bg-white/10 rounded mb-2" />
            <div className="h-2 w-full bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 400 }}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-green-500/20 transition-all animate-news block"
        >
          <span className="text-lg mt-0.5">{item.flag}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-mono text-gray-600 bg-white/5 px-1 py-0.5 rounded">
                {item.lang}
              </span>
              <span className="text-[10px] text-gray-600 truncate">{item.source}</span>
              <span className="text-[9px] text-gray-700 ml-auto flex-shrink-0">{item.time}</span>
            </div>
            <p className="text-[12px] text-gray-300 leading-snug truncate">{item.headlineTranslated}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-gray-500">{item.commodity}</span>
              <span
                className={`text-[10px] font-mono font-bold ${
                  item.sentiment < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {item.sentiment > 0 ? "+" : ""}
                {item.sentiment.toFixed(2)}
              </span>
              <span
                className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                  item.impact === "HIGH"
                    ? "bg-red-500/15 text-red-400"
                    : item.impact === "MED"
                      ? "bg-yellow-500/15 text-yellow-400"
                      : "bg-gray-500/15 text-gray-500"
                }`}
              >
                {item.impact}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
