import { NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { getPublicProductBySlug } from "@/server/catalog";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const product = await getPublicProductBySlug(slug);

    return NextResponse.json(successResponse(product));
  } catch (error) {
    return toErrorResponse(error);
  }
}
