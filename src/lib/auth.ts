import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(username: string): Promise<string> {
  void username; // Reserved for future session storage
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  // In production, store token in DB. For simplicity we use cookie value as session.
  return token;
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value ?? null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function login(username: string, password: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) return false;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return false;
  await createSession(username);
  return true;
}

export async function adminExists(): Promise<boolean> {
  const count = await prisma.adminUser.count();
  return count > 0;
}
