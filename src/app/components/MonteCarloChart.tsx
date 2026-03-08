"use client";

import { useEffect, useRef, useState } from "react";

interface SimulationResult {
  vanilla: number[][];
  aiEnhanced: number[][];
  actualPrice: number[];
}

function generateBrownianMotion(
  startPrice: number,
  days: number,
  mu: number,
  sigma: number,
  paths: number
): number[][] {
  const dt = 1 / 252;
  const results: number[][] = [];

  for (let p = 0; p < paths; p++) {
    const path = [startPrice];
    for (let i = 1; i < days; i++) {
      const randomShock =
        Math.sqrt(dt) * (Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()));
      const drift = (mu - 0.5 * sigma * sigma) * dt;
      const diffusion = sigma * randomShock;
      path.push(path[i - 1] * Math.exp(drift + diffusion));
    }
    results.push(path);
  }
  return results;
}

function generateActualPrice(startPrice: number, days: number): number[] {
  const path = [startPrice];
  const trend = 0.15;
  const vol = 0.22;
  const dt = 1 / 252;
  // Add a "news event" shock around day 15
  for (let i = 1; i < days; i++) {
    const shock =
      Math.sqrt(dt) * (Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()));
    let eventShock = 0;
    if (i === 15) eventShock = -0.035; // News event causes drop
    if (i === 16) eventShock = -0.02;
    if (i === 20) eventShock = 0.015; // Partial recovery
    path.push(path[i - 1] * Math.exp((trend - 0.5 * vol * vol) * dt + vol * shock + eventShock));
  }
  return path;
}

export default function MonteCarloChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sim, setSim] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const animFrameRef = useRef(0);

  const runSimulation = () => {
    setRunning(true);
    const startPrice = 100;
    const days = 60;
    const numPaths = 50;

    const vanilla = generateBrownianMotion(startPrice, days, 0.08, 0.25, numPaths);
    // AI-enhanced: adjusted mu and sigma based on "news signal"
    const aiEnhanced = generateBrownianMotion(startPrice, days, 0.06, 0.30, numPaths);
    // After day 15, AI paths diverge with better prediction
    for (const path of aiEnhanced) {
      for (let i = 14; i < days; i++) {
        path[i] = path[i] * (1 - 0.03 * (1 - (i - 14) / (days - 14)));
      }
    }
    const actualPrice = generateActualPrice(startPrice, days);

    setSim({ vanilla, aiEnhanced, actualPrice });
    setRunning(false);
  };

  useEffect(() => {
    runSimulation();
  }, []);

  useEffect(() => {
    if (!sim || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 40, right: 30, bottom: 50, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allPrices = [...sim.vanilla.flat(), ...sim.aiEnhanced.flat(), ...sim.actualPrice];
    const minP = Math.min(...allPrices) * 0.98;
    const maxP = Math.max(...allPrices) * 1.02;
    const days = sim.actualPrice.length;

    const xScale = (i: number) => padding.left + (i / (days - 1)) * chartW;
    const yScale = (p: number) => padding.top + chartH - ((p - minP) / (maxP - minP)) * chartH;

    let step = 0;
    const totalSteps = days;

    const draw = () => {
      step = Math.min(step + 1, totalSteps);
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (i / 5) * chartH;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = "#666";
        ctx.font = "11px monospace";
        ctx.textAlign = "right";
        const price = maxP - (i / 5) * (maxP - minP);
        ctx.fillText(`$${price.toFixed(1)}`, padding.left - 8, y + 4);
      }

      // X-axis labels
      ctx.fillStyle = "#666";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      for (let i = 0; i <= 4; i++) {
        const dayNum = Math.round((i / 4) * (days - 1));
        ctx.fillText(`Day ${dayNum}`, xScale(dayNum), height - padding.bottom + 20);
      }

      // News event marker
      if (step >= 15) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.fillRect(xScale(14), padding.top, xScale(17) - xScale(14), chartH);
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("LOCAL NEWS EVENT", xScale(15.5), padding.top - 8);
        ctx.font = "10px monospace";
        ctx.fillStyle = "#f87171";
        ctx.fillText("(detected by Schwarzwald)", xScale(15.5), padding.top + 12);
      }

      // Draw vanilla paths
      for (const path of sim.vanilla) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(100, 100, 255, 0.12)";
        ctx.lineWidth = 1;
        for (let i = 0; i < step; i++) {
          if (i === 0) ctx.moveTo(xScale(i), yScale(path[i]));
          else ctx.lineTo(xScale(i), yScale(path[i]));
        }
        ctx.stroke();
      }

      // Draw AI-enhanced paths
      for (const path of sim.aiEnhanced) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
        ctx.lineWidth = 1;
        for (let i = 0; i < step; i++) {
          if (i === 0) ctx.moveTo(xScale(i), yScale(path[i]));
          else ctx.lineTo(xScale(i), yScale(path[i]));
        }
        ctx.stroke();
      }

      // Draw actual price line
      ctx.beginPath();
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      for (let i = 0; i < step; i++) {
        if (i === 0) ctx.moveTo(xScale(i), yScale(sim.actualPrice[i]));
        else ctx.lineTo(xScale(i), yScale(sim.actualPrice[i]));
      }
      ctx.stroke();

      // Legend
      const legendY = height - 15;
      ctx.font = "12px monospace";

      ctx.fillStyle = "rgba(100, 100, 255, 0.6)";
      ctx.fillRect(padding.left, legendY - 8, 16, 3);
      ctx.fillStyle = "#888";
      ctx.textAlign = "left";
      ctx.fillText("Vanilla MC", padding.left + 22, legendY - 2);

      ctx.fillStyle = "rgba(34, 197, 94, 0.7)";
      ctx.fillRect(padding.left + 130, legendY - 8, 16, 3);
      ctx.fillStyle = "#888";
      ctx.fillText("Schwarzwald MC", padding.left + 152, legendY - 2);

      ctx.fillStyle = "#facc15";
      ctx.fillRect(padding.left + 290, legendY - 8, 16, 3);
      ctx.fillStyle = "#888";
      ctx.fillText("Actual Price", padding.left + 312, legendY - 2);

      if (step < totalSteps) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    step = 0;
    draw();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [sim]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-white/10"
        style={{ height: 420 }}
      />
      <button
        onClick={runSimulation}
        disabled={running}
        className="absolute top-3 right-3 px-3 py-1.5 text-xs font-mono bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
      >
        Re-run Simulation
      </button>
    </div>
  );
}
