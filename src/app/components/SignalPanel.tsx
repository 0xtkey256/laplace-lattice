"use client";

import type { DashboardSignal } from "@/lib/dashboard/types";

interface SignalPanelProps {
  signals: DashboardSignal[];
}

export default function SignalPanel({ signals }: SignalPanelProps) {
  return (
    <div className="space-y-2">
      {signals.map((signal, index) => (
        <div
          key={`${signal.commodity}-${index}`}
          className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-green-500/20 transition-all animate-news"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                signal.direction === "LONG"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {signal.direction}
            </span>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-gray-200 truncate">{signal.commodity}</div>
              <div className="text-[9px] text-gray-600 font-mono truncate">{signal.source}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-gray-300">
              {(signal.confidence * 100).toFixed(0)}%
            </div>
            <div className="flex gap-2 text-[8px] font-mono text-gray-600">
              <span>mu {signal.mu_adj > 0 ? "+" : ""}{signal.mu_adj.toFixed(2)}</span>
              <span>sigma x{signal.sigma_adj.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
