import { NextRequest, NextResponse } from "next/server";

import { AuditLogListQuerySchema, successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { listAdminAuditLogs } from "@/server/audit";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const query = AuditLogListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listAdminAuditLogs(query);

    return NextResponse.json(
      successResponse(result.logs, {
        page: query.page,
        pageSize: query.pageSize,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      }),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
