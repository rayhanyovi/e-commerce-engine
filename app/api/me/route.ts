import { NextRequest, NextResponse } from "next/server";

import { ErrorCodes, successResponse } from "@/shared/contracts";
import { getCurrentUser } from "@/server/auth";
import { AppError, toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication required");
    }

    return NextResponse.json(successResponse(user));
  } catch (error) {
    return toErrorResponse(error);
  }
}
