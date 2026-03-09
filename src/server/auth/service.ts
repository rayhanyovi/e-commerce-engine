import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import {
  ErrorCodes,
  type LoginDto,
  type RegisterDto,
  type UpdateProfileDto,
} from "@/shared/contracts";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";

import { hashPassword, verifyPassword } from "./password";
import { readSessionToken, verifySessionToken } from "./session";
import type { AuthUser, SessionPayload } from "./types";

const authUserSelect = {
  id: true,
  role: true,
  email: true,
  name: true,
  phone: true,
} satisfies Prisma.UserSelect;

type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

function mapAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    phone: user.phone,
  };
}

function toSessionPayload(user: AuthUser): SessionPayload {
  return {
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

async function getUserBySessionSubject(subject: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: subject },
    select: authUserSelect,
  });

  return user ? mapAuthUser(user) : null;
}

export async function registerUser(dto: RegisterDto) {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(409, ErrorCodes.VALIDATION_ERROR, "Email already registered");
  }

  const passwordHash = await hashPassword(dto.password);
  const user = await prisma.user.create({
    data: {
      role: "CUSTOMER",
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: passwordHash,
    },
    select: authUserSelect,
  });

  const authUser = mapAuthUser(user);

  return {
    user: authUser,
    session: toSessionPayload(authUser),
  };
}

export async function loginUser(dto: LoginDto) {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    select: {
      ...authUserSelect,
      password: true,
    },
  });

  if (!user?.password) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const passwordMatches = await verifyPassword(dto.password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const authUser = mapAuthUser(user);

  return {
    user: authUser,
    session: toSessionPayload(authUser),
  };
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = readSessionToken(request);

  return getCurrentUserByToken(token);
}

export async function getCurrentUserByToken(token: string | null): Promise<AuthUser | null> {

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  if (!session?.sub) {
    return null;
  }

  return getUserBySessionSubject(session.sub);
}

export async function requireUser(request: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication required");
  }

  return user;
}

export async function requireAdminUser(request: NextRequest): Promise<AuthUser> {
  const user = await requireUser(request);

  if (user.role !== "ADMIN") {
    throw new AppError(403, ErrorCodes.FORBIDDEN, "Admin access required");
  }

  return user;
}

export async function updateUserProfile(userId: string, dto: UpdateProfileDto) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: dto.name?.trim() || undefined,
      phone: dto.phone === undefined ? undefined : dto.phone.trim() || null,
    },
    select: authUserSelect,
  });

  return mapAuthUser(user);
}
