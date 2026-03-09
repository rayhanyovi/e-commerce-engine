import { NextRequest, NextResponse } from "next/server";

import {
  ErrorCodes,
  UpdateProfileSchema,
  successResponse,
} from "@/shared/contracts";
import { getCurrentUser, requireUser, updateUserProfile } from "@/server/auth";
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

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = UpdateProfileSchema.parse(await request.json());
    const updatedUser = await updateUserProfile(user.id, payload);

    return NextResponse.json(successResponse(updatedUser));
  } catch (error) {
    return toErrorResponse(error);
  }
}
