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

const memberSections = [
  {
    initials: "YM",
    name: "Yuki",
    section: "Geospatial Intelligence",
    desc: "AIS ship tracking & satellite imagery overlay",
    color: "border-cyan-500/20",
    tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    tag: "GEO",
    skeletonLines: [3, 2, 4, 1],
  },
  {
    initials: "HD",
    name: "Hammon",
    section: "Risk Management",
    desc: "Position sizing & portfolio exposure rules",
    color: "border-orange-500/20",
    tagColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    tag: "RISK",
    skeletonLines: [2, 4, 3, 2],
  },
  {
    initials: "RM",
    name: "Rafael",
    section: "Backtesting Engine",
    desc: "Historical validation & statistical significance",
    color: "border-pink-500/20",
    tagColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    tag: "BACKTEST",
    skeletonLines: [4, 2, 3, 1],
  },
  {
    initials: "TN",
    name: "Taiki",
    section: "FPGA / LLVM Pipeline",
    desc: "Hardware-accelerated MC engine & JIT strategy compiler",
    color: "border-green-500/20",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
    tag: "INFRA",
    skeletonLines: [2, 3, 4, 2],
    url: "https://laplace-fpga-llvm.vercel.app",
  },
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

        {/* Right panel - Signals + Member Sections */}
        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
          {/* Trading Signals */}
          <div className="card p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                Trading Signals
              </h2>
              <span className="text-[8px] font-mono text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                4 ACTIVE
              </span>
            </div>
            <div className="overflow-y-auto max-h-[140px]">
              <SignalPanel />
            </div>
          </div>

          {/* Member Placeholder Sections */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {memberSections.map((m, i) => {
              const isLive = "url" in m && m.url;
              const Wrapper = isLive ? "a" : "div";
              const wrapperProps = isLive ? { href: m.url as string, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Wrapper
                  key={i}
                  {...wrapperProps}
                  className={`card p-3 ${m.color} hover:bg-white/[0.03] transition-all block ${isLive ? "cursor-pointer glow-green" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-[7px] font-bold text-gray-400 flex-shrink-0">
                      {m.initials}
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[10px] font-semibold text-gray-300 truncate">{m.section}</span>
                      <span className={`text-[7px] font-mono px-1 py-0.5 rounded border ${m.tagColor} flex-shrink-0`}>
                        {m.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-[8px] text-gray-600 font-mono mb-2">{m.desc}</p>
                  {/* Skeleton loading bars */}
                  {!isLive && (
                    <div className="space-y-1.5">
                      {m.skeletonLines.map((width, j) => (
                        <div key={j} className="flex gap-1.5">
                          <div
                            className="h-1.5 rounded-full bg-white/[0.04] skeleton-pulse"
                            style={{ width: `${width * 25}%` }}
                          />
                          {width < 4 && (
                            <div
                              className="h-1.5 rounded-full bg-white/[0.03] skeleton-pulse"
                              style={{ width: `${(4 - width) * 15}%`, animationDelay: `${j * 0.2}s` }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[8px] font-mono text-gray-700">{m.name}</span>
                    {isLive ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 signal-live" />
                        <span className="text-[7px] font-mono text-green-400 font-bold">LIVE →</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-yellow-500/60 skeleton-pulse" />
                        <span className="text-[7px] font-mono text-yellow-500/60">BUILDING</span>
                      </div>
                    )}
                  </div>
                </Wrapper>
              );
            })}
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
