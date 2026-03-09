import { NextRequest, NextResponse } from "next/server";

import { BulkUpdateStoreConfigSchema, successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { bulkUpdateStoreConfigs, listAdminStoreConfigs } from "@/server/settings";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const settings = await listAdminStoreConfigs();

    return NextResponse.json(successResponse(settings));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminUser(request);
    const payload = BulkUpdateStoreConfigSchema.parse(await request.json());
    const result = await bulkUpdateStoreConfigs(payload, admin.id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
