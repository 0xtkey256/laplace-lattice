"use client";

const steps = [
  {
    icon: "📰",
    title: "Local News Scraping",
    desc: "Native language sources (PT, JP, ES)",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    tool: "Shisa AI",
  },
  {
    icon: "🧠",
    title: "Schwarzwald Analysis",
    desc: "AI model extracts commodity signals",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    tool: "Schwarzwald",
  },
  {
    icon: "📊",
    title: "Signal Aggregation",
    desc: "Volatility & drift adjustments",
    color: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
    tool: "CrustData",
  },
  {
    icon: "🎲",
    title: "Monte Carlo Engine",
    desc: "10K+ simulations with AI parameters",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-500/30",
    tool: "Blaxel",
  },
  {
    icon: "💹",
    title: "Trading Signal",
    desc: "Actionable alpha before global markets",
    color: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    tool: "Output",
  },
];

export default function PipelineDiagram() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`relative bg-gradient-to-b ${step.color} border ${step.border} rounded-xl p-4 w-full md:w-44 text-center transition-transform hover:scale-105`}
          >
            <div className="text-3xl mb-2">{step.icon}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
            <p className="text-[11px] text-gray-400 leading-tight">{step.desc}</p>
            <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
              {step.tool}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="hidden md:block text-green-500 text-2xl font-bold mx-1 select-none">
              &rarr;
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
