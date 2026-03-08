"use client";

import type { DashboardExecutionOrder } from "@/lib/dashboard/types";

interface ExecutionPanelProps {
  orders: DashboardExecutionOrder[];
}

function statusClasses(status: DashboardExecutionOrder["status"]): string {
  if (status === "FILLED") {
    return "bg-green-500/15 text-green-400 border-green-500/25";
  }
  if (status === "ROUTED") {
    return "bg-blue-500/15 text-blue-400 border-blue-500/25";
  }
  if (status === "QUEUED") {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
  }
  return "bg-red-500/15 text-red-400 border-red-500/25";
}

export default function ExecutionPanel({ orders }: ExecutionPanelProps) {
  if (orders.length === 0) {
    return (
      <div className="text-[9px] font-mono text-gray-600">
        No executable orders generated from current AI signals.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-gray-200 truncate">{order.commodity}</div>
              <div className="text-[8px] font-mono text-gray-600">
                {order.asset} · {order.orderType} · {order.side}
              </div>
            </div>
            <span className={`text-[8px] font-mono border rounded px-1.5 py-0.5 ${statusClasses(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-[8px] font-mono text-gray-500">
            <div>CONF {Math.round(order.confidence * 100)}%</div>
            <div>SIZE {order.sizePct.toFixed(2)}%</div>
            <div>LMT ${order.limitPrice.toFixed(2)}</div>
          </div>

          <p className="mt-1.5 text-[8px] font-mono text-gray-600 leading-relaxed">{order.rationale}</p>
        </div>
      ))}
    </div>
  );
}

