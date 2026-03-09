import { NextRequest, NextResponse } from "next/server";

import { UserListQuerySchema, successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { listAdminUsers } from "@/server/users";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const query = UserListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listAdminUsers(query);

    return NextResponse.json(
      successResponse(result.users, {
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
