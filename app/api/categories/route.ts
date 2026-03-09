import { NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { listPublicCategories } from "@/server/catalog";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await listPublicCategories();

    return NextResponse.json(successResponse(categories));
  } catch (error) {
    return toErrorResponse(error);
  }
}
