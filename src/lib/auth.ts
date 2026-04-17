import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "srp_session";

type SessionPayload = {
  userId: number;
  role: Role;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

type AuthResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse<{ error: string }> };

export async function requireAuth(request: NextRequest, roles?: Role[]): Promise<AuthResult> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const payload = verifySession(token);
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "User not found" }, { status: 401 }) };
  }

  if (roles && !roles.includes(user.role)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true, user };
}
