"use client";

import { useEffect, useRef } from "react";

import type { MonteCarloSimulation } from "@/lib/dashboard/types";

interface MonteCarloChartProps {
  simulation: MonteCarloSimulation;
  onRerun: () => void;
  rerunning: boolean;
}

export default function MonteCarloChart({ simulation, onRerun, rerunning }: MonteCarloChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 35, right: 20, bottom: 45, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allPrices = [
      ...simulation.paths.flat(),
      ...simulation.meanPath,
      ...simulation.percentiles["5th"],
      ...simulation.percentiles["95th"],
      ...simulation.actualPrice,
    ];

    const minPrice = Math.min(...allPrices) * 0.98;
    const maxPrice = Math.max(...allPrices) * 1.02;
    const steps = simulation.actualPrice.length - 1;

    const xScale = (step: number) => padding.left + (step / Math.max(steps, 1)) * chartWidth;
    const yScale = (price: number) =>
      padding.top + chartHeight - ((price - minPrice) / Math.max(maxPrice - minPrice, 1e-6)) * chartHeight;

    let frameStep = 0;
    const totalSteps = steps;

    const drawSeries = (values: number[], color: string, lineWidth: number, stepLimit: number) => {
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      for (let index = 0; index <= stepLimit; index++) {
        if (index === 0) {
          context.moveTo(xScale(index), yScale(values[index]));
        } else {
          context.lineTo(xScale(index), yScale(values[index]));
        }
      }
      context.stroke();
    };

    const draw = () => {
      frameStep = Math.min(frameStep + 1, totalSteps);
      context.clearRect(0, 0, width, height);

      context.fillStyle = "#050505";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(34, 197, 94, 0.06)";
      context.lineWidth = 0.5;
      for (let index = 0; index <= 5; index++) {
        const y = padding.top + (index / 5) * chartHeight;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);
        context.stroke();

        context.fillStyle = "#444";
        context.font = "10px monospace";
        context.textAlign = "right";
        const price = maxPrice - (index / 5) * (maxPrice - minPrice);
        context.fillText(`$${price.toFixed(0)}`, padding.left - 6, y + 3);
      }

      context.fillStyle = "#444";
      context.font = "10px monospace";
      context.textAlign = "center";
      for (let index = 0; index <= 4; index++) {
        const step = Math.round((index / 4) * steps);
        context.fillText(`D${step}`, xScale(step), height - padding.bottom + 16);
      }

      if (frameStep >= 15) {
        const gradient = context.createLinearGradient(xScale(14), 0, xScale(17), 0);
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.0)");
        gradient.addColorStop(0.3, "rgba(239, 68, 68, 0.12)");
        gradient.addColorStop(0.7, "rgba(239, 68, 68, 0.12)");
        gradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");
        context.fillStyle = gradient;
        context.fillRect(xScale(13), padding.top, xScale(18) - xScale(13), chartHeight);

        context.fillStyle = "#ef4444";
        context.font = "bold 9px monospace";
        context.fillText("NEWS EVENT", xScale(15.5), padding.top + 14);
      }

      for (const path of simulation.paths) {
        drawSeries(path, "rgba(34, 197, 94, 0.07)", 0.8, frameStep);
      }

      drawSeries(simulation.percentiles["5th"], "rgba(100, 100, 255, 0.25)", 1.2, frameStep);
      drawSeries(simulation.percentiles["95th"], "rgba(100, 100, 255, 0.25)", 1.2, frameStep);
      drawSeries(simulation.meanPath, "rgba(59, 130, 246, 0.9)", 2, frameStep);

      context.shadowColor = "rgba(250, 204, 21, 0.4)";
      context.shadowBlur = 8;
      drawSeries(simulation.actualPrice, "#facc15", 2.5, frameStep);
      context.shadowBlur = 0;

      const legendY = height - 8;
      context.font = "10px monospace";
      context.textAlign = "left";

      context.fillStyle = "rgba(34, 197, 94, 0.65)";
      context.fillRect(padding.left, legendY - 6, 12, 2);
      context.fillStyle = "#555";
      context.fillText("MC Paths", padding.left + 16, legendY - 1);

      context.fillStyle = "rgba(59, 130, 246, 0.9)";
      context.fillRect(padding.left + 95, legendY - 6, 12, 2);
      context.fillStyle = "#555";
      context.fillText("Mean", padding.left + 111, legendY - 1);

      context.fillStyle = "#facc15";
      context.fillRect(padding.left + 155, legendY - 6, 12, 2);
      context.fillStyle = "#555";
      context.fillText("Actual", padding.left + 171, legendY - 1);

      if (frameStep < totalSteps) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [simulation]);

  return (
    <div className="relative h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: 280 }}
      />
      <button
        onClick={onRerun}
        disabled={rerunning}
        className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors text-gray-400 disabled:opacity-50"
      >
        {rerunning ? "Refreshing..." : "Re-run"}
      </button>
    </div>
  );
}
