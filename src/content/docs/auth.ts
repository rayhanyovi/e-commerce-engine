import type { Metadata } from "next";

export const authMetadata: Metadata = {
  title: "Auth & Sessions | E-Commerce Engine Docs",
  description:
    "How the e-commerce engine handles authentication with JWT sessions, httpOnly cookies, role-based access control, and guest cart claiming.",
};

export const authPageContent = {
  eyebrow: "Architecture",
  title: "Auth & Sessions",
  description:
    "The engine authenticates users with JWT sessions stored in httpOnly cookies, enforces role-based access via server guards, and automatically claims guest carts on login or registration.",
  overview: [
    "Authentication is built on the jose library for JWT signing and verification. When a user logs in or registers, the server creates a signed JWT containing the user ID, email, name, and role, then sets it as an httpOnly cookie with secure and same-site attributes. The cookie is automatically sent with every request by the browser, so client code never handles tokens directly.",
    "Sessions are stateless on the server side. The JWT is self-contained and verified on each request using the AUTH_SECRET environment variable. There is no session store or database lookup for authentication. The JWT signature is the sole proof of identity.",
    "The same-origin deployment model means the storefront and API share a single cookie domain. There is no cross-origin token exchange, no refresh token rotation, and no CORS configuration to manage.",
  ],
  guardsIntro:
    "Route handlers use three server guards to authenticate and authorize requests. Each guard reads the session cookie, verifies the JWT, and either returns the user or throws an HTTP error.",
  guards: [
    {
      name: "getCurrentUser",
      summary:
        "Optional authentication. Returns the authenticated user if a valid session cookie is present, or null if no cookie exists. Use this for pages that show different content for guests and logged-in users, such as the storefront header.",
    },
    {
      name: "requireUser",
      summary:
        "Requires any authenticated user. Throws UNAUTHORIZED if no valid session is present. Use this for endpoints that any logged-in user can access, such as placing an order or managing addresses.",
    },
    {
      name: "requireAdminUser",
      summary:
        "Requires the ADMIN role. Throws UNAUTHORIZED if no session exists, or FORBIDDEN if the user is not an admin. Use this for all admin dashboard endpoints.",
    },
  ],
  guardsCode: `import { requireUser } from "@/server/auth";

export async function GET(request: Request) {
  const user = await requireUser(request);
  // user.id, user.email, user.name, user.role
  // ... handle request
}

// Admin-only endpoint
import { requireAdminUser } from "@/server/auth";

export async function DELETE(request: Request) {
  const admin = await requireAdminUser(request);
  // Only ADMIN role reaches this point
  // ... handle admin action
}`,
  registration: [
    "When a new user registers, the server validates the registration payload against the Zod schema, hashes the password with bcrypt, creates the user record in the database, and immediately issues a session cookie so the user is logged in without a separate login step.",
    "After issuing the session, the server checks for a guest cart cookie. If the user was browsing as a guest and added items to a cart, that cart is claimed by associating it with the new user ID. The guest cart cookie is cleared, and the user sees their cart contents preserved across the registration boundary.",
  ],
  login: [
    "Login accepts email and password, looks up the user by email, and verifies the password against the stored bcrypt hash. On success, a new JWT session cookie is issued. On failure, a generic UNAUTHORIZED error is returned without revealing whether the email exists, which prevents user enumeration attacks.",
    "Like registration, the login flow also merges any existing guest cart. If the returning user already has an active cart from a previous session, the guest cart items are merged into it. If no prior cart exists, the guest cart is simply claimed. This ensures a seamless transition between anonymous browsing and authenticated shopping.",
  ],
  roles: [
    "The engine implements a binary role system with two roles: CUSTOMER and ADMIN. Every user is assigned exactly one role at creation time. There are no hierarchical permissions, role groups, or fine-grained capability flags. Access control is a simple role check.",
    "CUSTOMER users can browse the catalog, manage their cart, place orders, submit payment proofs, manage their addresses, and view their order history. They cannot access admin endpoints.",
    "ADMIN users have full access to the admin dashboard, product management, order management, payment review, promotion management, inventory adjustments, user management, and audit logs. Admin routes are protected by requireAdminUser, which checks the role field on the JWT payload.",
  ],
  flowTitle: "Auth Flow",
  flowDiagram:
    "Register/Login -> Validate -> Hash/Check Password -> Create Session Token -> Set httpOnly Cookie -> Claim Guest Cart -> Return User",
} as const;
