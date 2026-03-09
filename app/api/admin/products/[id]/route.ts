import { NextRequest, NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { getAdminProductById } from "@/server/catalog";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser(request);
    const { id } = await context.params;
    const product = await getAdminProductById(id);

    return NextResponse.json(successResponse(product));
  } catch (error) {
    return toErrorResponse(error);
  }
}
