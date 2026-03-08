"use client";

const steps = [
  { icon: "\u{1F4F0}", label: "CrustData Scrape", status: "active" },
  { icon: "\u{1F30F}", label: "Gemma Translation", status: "active" },
  { icon: "\u{1F9E0}", label: "Schwarzwald", status: "active" },
  { icon: "\u{1F4CA}", label: "Signal Agg", status: "active" },
  { icon: "\u{1F3B2}", label: "Monte Carlo", status: "active" },
  { icon: "\u{1F4B9}", label: "Trade Signal", status: "active" },
  { icon: "\u{2699}\u{FE0F}", label: "Execution", status: "active" },
];

export default function PipelineFlow() {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] hover:border-green-500/20 transition-colors">
            <span className="text-sm">{step.icon}</span>
            <span className="text-[9px] font-mono text-gray-400 whitespace-nowrap">{step.label}</span>
            <span className="w-1 h-1 rounded-full bg-green-400 signal-live" />
          </div>
          {i < steps.length - 1 && (
            <span className="text-green-600 text-[10px] mx-0.5 select-none">{"\u2192"}</span>
          )}
        </div>
      ))}
    </div>
  );
}
