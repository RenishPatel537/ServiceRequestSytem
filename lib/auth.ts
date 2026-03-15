import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifyToken } from "./jwt";
import { SessionPayload } from "@/types/auth";

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export type AuthResult =
  | { success: true; userId: number; username: string; roles: string[]; staffId: number | null }
  | { success: false; error: string; status: number };

export async function requireAuth(req: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return { success: false, error: "Unauthorized", status: 401 };
    }

    const hasRole = decoded.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return { success: false, error: "Forbidden", status: 403 };
    }

    return {
      success: true,
      userId: decoded.userId,
      username: decoded.username,
      roles: decoded.roles,
      staffId: decoded.staffId
    };
  } catch (error) {
    return { success: false, error: "Unauthorized", status: 401 };
  }
}
export async function getAuthSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    return {
      userId: decoded.userId,
      username: decoded.username,
      roles: decoded.roles,
      staffId: decoded.staffId,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Dummy expires for type compatibility
    };
  } catch (error) {
    return null;
  }
}

// Alias for getAuthSession if needed
export const getSession = getAuthSession;
