import { NextRequest, NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { getAdminDashboardSummary } from "@/server/dashboard";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const summary = await getAdminDashboardSummary();

    return NextResponse.json(successResponse(summary));
  } catch (error) {
    return toErrorResponse(error);
  }
}
