import { NextResponse } from "next/server";

import { ProductSlugRouteParamsSchema, successResponse } from "@/shared/contracts";
import { getPublicProductBySlug } from "@/server/catalog";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = ProductSlugRouteParamsSchema.parse(await context.params);
    const product = await getPublicProductBySlug(slug);

    return NextResponse.json(successResponse(product));
  } catch (error) {
    return toErrorResponse(error);
  }
}
