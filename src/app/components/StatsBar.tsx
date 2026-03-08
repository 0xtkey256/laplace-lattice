"use client";

import { useEffect, useState } from "react";

import type { DashboardStats } from "@/lib/dashboard/types";

interface StatsBarProps {
  stats: DashboardStats;
  warnings: string[];
}

export default function StatsBar({ stats, warnings }: StatsBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const statsList = [
    { label: "SIGNALS", value: String(stats.signals), color: "text-green-400" },
    { label: "EDGE", value: stats.edge, color: "text-yellow-400" },
    { label: "MC PATHS", value: stats.mcPaths.toLocaleString(), color: "text-blue-400" },
    { label: "LANGUAGES", value: String(stats.languages), color: "text-purple-400" },
    { label: "SOURCES", value: String(stats.sources), color: "text-cyan-400" },
  ];

  const degraded = warnings.length > 0;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.05]">
      <div className="flex items-center gap-6">
        {statsList.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-gray-600">{stat.label}</span>
            <span className={`text-[12px] font-mono font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${degraded ? "bg-yellow-400" : "bg-green-400"} signal-live`} />
          <span className={`text-[9px] font-mono ${degraded ? "text-yellow-400" : "text-green-400"}`}>
            {degraded ? "DEGRADED" : "LIVE"}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-600">{time}</span>
      </div>
    </div>
  );
}
