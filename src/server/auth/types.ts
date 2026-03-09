export type AuthRole = "CUSTOMER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: AuthRole;
  email: string;
  name: string;
  phone?: string | null;
}

export interface SessionPayload {
  sub: string;
  role: AuthRole;
  email: string;
  name: string;
}
