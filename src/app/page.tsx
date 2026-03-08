import MonteCarloChart from "./components/MonteCarloChart";
import PipelineDiagram from "./components/PipelineDiagram";
import NewsFeed from "./components/NewsFeed";

const team = [
  { name: "Taiki Nakamura", role: "Full-Stack / FPGA / LLVM", focus: "Infrastructure & Integration" },
  { name: "Yuki Murakami", role: "Geospatial Engineer", focus: "Data Pipeline & News Scraping" },
  { name: "Hammon Dutra", role: "Hedge Fund Strategy", focus: "Domain Logic & Trading Rules" },
  { name: "Rafael Mori", role: "Math Researcher", focus: "Monte Carlo Engine & Quant Models" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="animate-fade-in">
            <div className="inline-block mb-4 px-3 py-1 text-xs font-mono text-green-400 border border-green-500/30 rounded-full bg-green-500/10">
              YC Hackathon 2026 &middot; AI-Native Hedge Fund
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Laplace</span>
              <span className="text-green-400">Lattice</span>
            </h1>
            <p className="text-sm font-mono text-gray-500 -mt-4 mb-2">
              powered by <span className="text-purple-400">Schwarzwald</span> AI
            </p>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed">
              Capturing alpha through{" "}
              <span className="text-white font-semibold">multilingual news intelligence</span>{" "}
              before global markets react.
            </p>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-lg animate-fade-in-delay-1">
            <div>
              <div className="text-3xl font-bold text-green-400">3-8h</div>
              <div className="text-xs text-gray-500 font-mono mt-1">INFORMATION EDGE</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-xs text-gray-500 font-mono mt-1">MC SIMULATIONS</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">5+</div>
              <div className="text-xs text-gray-500 font-mono mt-1">LANGUAGES</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
            <h2 className="text-lg font-bold text-red-400 mb-3">The Problem</h2>
            <p className="text-gray-400 leading-relaxed">
              Commodity-moving news breaks in local languages &mdash; Portuguese for Brazilian soybeans,
              Japanese for semiconductor supply chains &mdash; hours or days before English-speaking
              markets react. Traditional funds miss this window entirely.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
            <h2 className="text-lg font-bold text-green-400 mb-3">Our Solution</h2>
            <p className="text-gray-400 leading-relaxed">
              Schwarzwald AI agents scrape local news in native languages, extract commodity signals with
              sentiment analysis, and feed them into a Monte Carlo simulation engine that produces
              better price predictions than either method alone.
            </p>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-2">Architecture</h2>
        <p className="text-gray-500 mb-8 text-sm font-mono">
          News &rarr; Schwarzwald Analysis &rarr; Signal &rarr; Monte Carlo &rarr; Alpha
        </p>
        <PipelineDiagram />
      </section>

      {/* Two columns: News Feed + Monte Carlo */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* News Feed */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-2">Live Signal Feed</h2>
            <p className="text-gray-500 mb-6 text-sm font-mono">
              Real-time local news &rarr; Schwarzwald sentiment extraction
            </p>
            <NewsFeed />
          </div>

          {/* Monte Carlo */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-2">Monte Carlo Simulation</h2>
            <p className="text-gray-500 mb-6 text-sm font-mono">
              Geometric Brownian Motion &middot; Schwarzwald-adjusted &#963; and &#956; parameters
            </p>
            <MonteCarloChart />
            <div className="mt-4 p-4 rounded-lg bg-white/[0.03] border border-white/10">
              <p className="text-xs text-gray-500 font-mono leading-relaxed">
                <span className="text-green-400 font-bold">How it works:</span>{" "}
                When a local news event is detected (red zone), Schwarzwald adjusts the volatility (&#963;)
                and drift (&#956;) parameters fed into the Monte Carlo engine. The green paths
                (Schwarzwald-enhanced) track closer to actual price movement (yellow line) than vanilla
                simulations (blue paths) that miss the signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formula */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="p-8 rounded-xl bg-white/[0.02] border border-white/10 text-center">
          <h2 className="text-lg font-bold text-gray-400 mb-4 font-mono">THE MATH</h2>
          <div className="text-2xl md:text-3xl font-mono text-white mb-4">
            dS = <span className="text-yellow-400">&#956;(t)</span> &middot; S &middot; dt +{" "}
            <span className="text-green-400">&#963;(t)</span> &middot; S &middot; dW
          </div>
          <div className="flex justify-center gap-8 text-sm font-mono">
            <div>
              <span className="text-yellow-400">&#956;(t)</span>{" "}
              <span className="text-gray-500">= &#956;_base + f(</span>
              <span className="text-blue-400">Schwarzwald</span>
              <span className="text-gray-500">)</span>
            </div>
            <div>
              <span className="text-green-400">&#963;(t)</span>{" "}
              <span className="text-gray-500">= &#963;_base + g(</span>
              <span className="text-blue-400">Schwarzwald</span>
              <span className="text-gray-500">)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8">Tech Stack & Sponsor Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "Shisa AI", desc: "Japanese news analysis", tag: "SPONSOR" },
            { name: "CrustData", desc: "Market data APIs", tag: "SPONSOR" },
            { name: "Blaxel", desc: "AI agent sandbox", tag: "SPONSOR" },
            { name: "Python / FastAPI", desc: "Backend engine", tag: "CORE" },
            { name: "Next.js", desc: "Dashboard", tag: "CORE" },
            { name: "Schwarzwald", desc: "Multilingual NLP model", tag: "AI" },
          ].map((tech, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{tech.name}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                    tech.tag === "SPONSOR"
                      ? "bg-green-500/20 text-green-400"
                      : tech.tag === "AI"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {tech.tag}
                </span>
              </div>
              <p className="text-xs text-gray-500">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8">Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((member, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/30 to-blue-500/30 mx-auto mb-3 flex items-center justify-center text-lg font-bold">
                {member.name[0]}
              </div>
              <h3 className="font-semibold text-sm">{member.name}</h3>
              <p className="text-[11px] text-gray-500 mt-1">{member.role}</p>
              <p className="text-[11px] text-green-400/70 mt-1">{member.focus}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="text-gray-600 text-xs font-mono">
          Built at YC Hackathon Tokyo 2026 &middot; Compiled
        </div>
      </footer>
    </main>
  );
}
