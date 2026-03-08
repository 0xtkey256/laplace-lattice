import MonteCarloChart from "../components/MonteCarloChart";
import NewsFeed from "../components/NewsFeed";
import SignalPanel from "../components/SignalPanel";
import StatsBar from "../components/StatsBar";
import FormulaBar from "../components/FormulaBar";
import PipelineFlow from "../components/PipelineFlow";

const team = [
  { initials: "TN", name: "Taiki", role: "Infra" },
  { initials: "YM", name: "Yuki", role: "Geo/Data" },
  { initials: "HD", name: "Hammon", role: "Strategy" },
  { initials: "RM", name: "Rafael", role: "Quant" },
];

export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col forest-bg overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-white">Laplace</span>
            <span className="text-green-400">Lattice</span>
          </a>
          <span className="text-[9px] font-mono text-purple-400/60 border border-purple-500/20 px-1.5 py-0.5 rounded">
            Schwarzwald v0.1
          </span>
          <span className="text-[9px] font-mono text-gray-600 ml-2">
            AI-Native Hedge Fund
          </span>
        </div>
        <div className="flex items-center gap-3">
          {team.map((m, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400"
              title={`${m.name} - ${m.role}`}
            >
              {m.initials}
            </div>
          ))}
          <div className="h-5 w-px bg-white/10 mx-1" />
          <span className="text-[9px] font-mono px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
            YC Hackathon 2026
          </span>
        </div>
      </header>

      {/* Stats bar */}
      <StatsBar />

      {/* Pipeline flow */}
      <div className="px-5 py-2 border-b border-white/[0.04] bg-black/20">
        <PipelineFlow />
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-4 overflow-hidden">
        {/* Left panel - News Feed */}
        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
          <div className="card p-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                Dark Forest Feed
              </h2>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 signal-live" />
                <span className="text-[8px] font-mono text-green-500">SCANNING</span>
              </div>
            </div>
            <p className="text-[9px] text-gray-600 font-mono mb-2">
              Local news in native languages via CrustData
            </p>
            <div className="flex-1 overflow-hidden">
              <NewsFeed />
            </div>
          </div>
        </div>

        {/* Center - Monte Carlo Chart */}
        <div className="col-span-6 flex flex-col gap-3 overflow-hidden">
          {/* Chart */}
          <div className="card p-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Monte Carlo Simulation
                </h2>
                <p className="text-[9px] text-gray-600 font-mono">
                  Geometric Brownian Motion {"\u00B7"} 10,000 paths {"\u00B7"} Schwarzwald-adjusted {"\u03C3"}, {"\u03BC"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SOYBEANS (ZS)
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <MonteCarloChart />
            </div>
          </div>

          {/* Formula */}
          <FormulaBar />
        </div>

        {/* Right panel - Signals */}
        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
          {/* Trading Signals */}
          <div className="card p-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                Trading Signals
              </h2>
              <span className="text-[8px] font-mono text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                4 ACTIVE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SignalPanel />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="card p-3">
            <h2 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
              Powered By
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: "CrustData", tag: "DATA", color: "text-green-400 bg-green-500/10 border-green-500/20" },
                { name: "Shisa AI", tag: "NLP", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                { name: "Blaxel", tag: "INFRA", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                { name: "Schwarzwald", tag: "AI", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/[0.02] border border-white/[0.05]"
                >
                  <span className={`text-[7px] font-mono px-1 py-0.5 rounded border ${t.color}`}>
                    {t.tag}
                  </span>
                  <span className="text-[10px] text-gray-400">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Forest Thesis */}
          <div className="card p-3 border-green-500/10">
            <div className="text-[10px] font-mono text-green-400/70 leading-relaxed">
              <span className="text-green-400 font-bold">The Dark Forest Thesis:</span>{" "}
              Markets are efficient in English. Alpha hides in the dark forest of local-language
              news. Schwarzwald navigates it.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <footer className="px-5 py-2 border-t border-white/[0.05] bg-black/40 flex items-center justify-between">
        <span className="text-[9px] font-mono text-gray-700">
          Laplace Lattice {"\u00B7"} YC Hackathon Tokyo 2026 {"\u00B7"} Compiled
        </span>
        <span className="text-[9px] font-mono text-gray-700">
          Schwarzwald = Black Forest {"\u00B7"} Finding alpha in the dark
        </span>
      </footer>
    </div>
  );
}
