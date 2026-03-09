import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/server/http";

const authMocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  createSessionToken: vi.fn(),
  applySessionCookie: vi.fn((response: NextResponse) => response),
  clearSessionCookie: vi.fn((response: NextResponse) => response),
  getCurrentUser: vi.fn(),
  requireUser: vi.fn(),
  updateUserProfile: vi.fn(),
}));

const cartMocks = vi.hoisted(() => ({
  claimGuestCart: vi.fn(),
  clearGuestCartCookie: vi.fn((response: NextResponse) => response),
  readGuestCartToken: vi.fn(),
}));

vi.mock("@/server/auth", () => authMocks);
vi.mock("@/server/cart", () => cartMocks);

import { POST as loginPost } from "../../app/api/auth/login/route";
import { POST as logoutPost } from "../../app/api/auth/logout/route";
import { POST as registerPost } from "../../app/api/auth/register/route";
import { GET as meGet, PATCH as mePatch } from "../../app/api/me/route";

type StrictRequestInit = Omit<RequestInit, "signal"> & {
  signal?: AbortSignal;
};

function createJsonRequest(url: string, body: unknown, init?: RequestInit) {
  const sanitizedInit: StrictRequestInit = {
    ...init,
    signal: init?.signal ?? undefined,
  };

  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(sanitizedInit.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...sanitizedInit,
  });
}

describe("auth route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in a user, claims guest cart, and applies a session cookie", async () => {
    const user = {
      id: "cmfauthuser000000000000001",
      role: "CUSTOMER" as const,
      email: "user@example.com",
      name: "Session User",
      phone: null,
    };

    authMocks.loginUser.mockResolvedValue({
      user,
      session: {
        sub: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
    });
    authMocks.createSessionToken.mockResolvedValue("session-token");
    cartMocks.readGuestCartToken.mockReturnValue("guest-token");

    const response = await loginPost(
      createJsonRequest("http://localhost/api/auth/login", {
        email: user.email,
        password: "Password123!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: {
        user,
      },
    });
    expect(authMocks.loginUser).toHaveBeenCalledWith({
      email: user.email,
      password: "Password123!",
    });
    expect(cartMocks.claimGuestCart).toHaveBeenCalledWith(user.id, "guest-token");
    expect(authMocks.createSessionToken).toHaveBeenCalledWith({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    expect(authMocks.applySessionCookie).toHaveBeenCalledWith(
      expect.any(NextResponse),
      "session-token",
    );
    expect(cartMocks.clearGuestCartCookie).toHaveBeenCalledWith(expect.any(NextResponse));
  });

  it("returns a validation envelope when login payload is invalid", async () => {
    const response = await loginPost(
      createJsonRequest("http://localhost/api/auth/login", {
        email: "not-an-email",
        password: "",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });

  it("registers a user and applies a session cookie", async () => {
    const user = {
      id: "cmfauthuser000000000000002",
      role: "CUSTOMER" as const,
      email: "new-user@example.com",
      name: "New User",
      phone: "+628111111111",
    };

    authMocks.registerUser.mockResolvedValue({
      user,
      session: {
        sub: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
    });
    authMocks.createSessionToken.mockResolvedValue("register-session-token");
    cartMocks.readGuestCartToken.mockReturnValue(null);

    const response = await registerPost(
      createJsonRequest("http://localhost/api/auth/register", {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: "Password123!",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: {
        user,
      },
    });
    expect(authMocks.registerUser).toHaveBeenCalled();
    expect(authMocks.applySessionCookie).toHaveBeenCalledWith(
      expect.any(NextResponse),
      "register-session-token",
    );
  });

  it("clears the session cookie on logout", async () => {
    const response = await logoutPost();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      data: { success: true },
      error: null,
    });
    expect(authMocks.clearSessionCookie).toHaveBeenCalledWith(expect.any(NextResponse));
  });

  it("returns the current session via GET /api/me", async () => {
    const user = {
      id: "cmfauthuser000000000000003",
      role: "CUSTOMER" as const,
      email: "profile@example.com",
      name: "Profile User",
      phone: "+628222222222",
    };

    authMocks.getCurrentUser.mockResolvedValue(user);

    const response = await meGet(new NextRequest("http://localhost/api/me"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: user,
    });
  });

  it("returns 401 when GET /api/me is requested without a session", async () => {
    authMocks.getCurrentUser.mockResolvedValue(null);

    const response = await meGet(new NextRequest("http://localhost/api/me"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("updates the authenticated profile via PATCH /api/me", async () => {
    const user = {
      id: "cmfauthuser000000000000004",
      role: "CUSTOMER" as const,
      email: "patch@example.com",
      name: "Patch User",
      phone: null,
    };
    const updatedUser = {
      ...user,
      name: "Patched User",
      phone: "+628333333333",
    };

    authMocks.requireUser.mockResolvedValue(user);
    authMocks.updateUserProfile.mockResolvedValue(updatedUser);

    const response = await mePatch(
      new NextRequest("http://localhost/api/me", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: updatedUser.name,
          phone: updatedUser.phone,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: updatedUser,
    });
    expect(authMocks.updateUserProfile).toHaveBeenCalledWith(user.id, {
      name: updatedUser.name,
      phone: updatedUser.phone,
    });
  });

  it("returns 401 when PATCH /api/me is requested without authentication", async () => {
    authMocks.requireUser.mockRejectedValue(
      new AppError(401, "UNAUTHORIZED", "Authentication required"),
    );

    const response = await mePatch(
      new NextRequest("http://localhost/api/me", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "No Session",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });
});
