import { NextRequest, NextResponse } from "next/server";

import { UpdateProductSchema, successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { deleteProduct, getAdminProductById, updateProduct } from "@/server/catalog";
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser(request);
    const { id } = await context.params;
    const payload = UpdateProductSchema.parse(await request.json());
    const product = await updateProduct(id, payload);

    return NextResponse.json(successResponse(product));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser(request);
    const { id } = await context.params;
    const result = await deleteProduct(id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
