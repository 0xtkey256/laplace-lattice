import { NextResponse } from "next/server";

import { buildDashboardData } from "@/lib/dashboard/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await buildDashboardData();
  return NextResponse.json(data);
}
