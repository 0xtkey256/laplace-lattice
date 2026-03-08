"use client";

import type { DashboardFormula } from "@/lib/dashboard/types";

interface FormulaBarProps {
  formula: DashboardFormula;
  asset: string;
}

export default function FormulaBar({ formula, asset }: FormulaBarProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
      <div className="text-sm font-mono text-gray-300">
        dS = <span className="text-yellow-400">mu(t)</span> · S · dt + <span className="text-green-400">sigma(t)</span> · S · dW
      </div>
      <div className="h-4 w-px bg-white/10" />
      <div className="flex gap-3 text-[10px] font-mono text-gray-600">
        <span>
          <span className="text-yellow-400">mu</span> base {formula.baseMu.toFixed(3)} + adj {formula.muAdjustment >= 0 ? "+" : ""}{formula.muAdjustment.toFixed(3)}
        </span>
        <span>
          <span className="text-green-400">sigma</span> base {formula.baseSigma.toFixed(3)} x {formula.sigmaMultiplier.toFixed(3)}
        </span>
        <span className="text-blue-400">ASSET {asset}</span>
      </div>
    </div>
  );
}
