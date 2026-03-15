import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// Public routes that don't need authentication
const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/",
  "/_next/",
  "/favicon.ico",
  "/images/",
];

// Role-based route protection mapping
const ROLE_PATH_MAP: Record<string, string> = {
  "/admin": "ADMIN",
  "/requestor": "REQUESTOR",
  "/technician": "TECHNICIAN",
  "/hod": "HOD",
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Auth check for protected routes
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = verifyToken(token);

    // 3. Authorization check (Role mismatch)
    // Find if the current path starts with any of the protected base paths
    const protectedBasePath = Object.keys(ROLE_PATH_MAP).find((path) =>
      pathname.startsWith(path),
    );

    if (protectedBasePath) {
      const requiredRole = ROLE_PATH_MAP[protectedBasePath];
      if (!payload.roles.includes(requiredRole)) {
        // Logged-in but wrong role
        console.warn(
          `Role mismatch: User ${payload.username} attempted to access ${pathname} without ${requiredRole} role.`,
        );
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api(?!/auth)|_next/static|_next/image|favicon.ico).*)"],
};
