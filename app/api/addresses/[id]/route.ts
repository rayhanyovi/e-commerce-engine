import { NextRequest, NextResponse } from "next/server";

import {
  UpdateAddressSchema,
  successResponse,
} from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { deleteAddress, updateAddress } from "@/server/addresses";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await requireUser(request);
    const payload = UpdateAddressSchema.parse(await request.json());
    const { id } = await context.params;
    const address = await updateAddress(user.id, id, payload);

    return NextResponse.json(successResponse(address));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const result = await deleteAddress(user.id, id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
