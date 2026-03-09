import { NextRequest, NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { initializeMissingStoreConfigs } from "@/server/settings";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminUser(request);
    const result = await initializeMissingStoreConfigs(admin.id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
