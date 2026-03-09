import { NextRequest, NextResponse } from "next/server";

import {
  CreateAddressSchema,
  successResponse,
} from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { createAddress, listMyAddresses } from "@/server/addresses";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const addresses = await listMyAddresses(user.id);

    return NextResponse.json(successResponse(addresses));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = CreateAddressSchema.parse(await request.json());
    const address = await createAddress(user.id, payload);

    return NextResponse.json(successResponse(address));
  } catch (error) {
    return toErrorResponse(error);
  }
}
