// Server-only session helpers. Server components do NOT forward the
// browser's cookies on fetch, so we read them via next/headers and attach
// them explicitly, talking straight to the backend (no proxy hop needed on
// the server side).

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { SessionUser } from "./types";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3000/api";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${API_INTERNAL_URL}/user/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as SessionUser;
  } catch {
    return null;
  }
}

/** Require an ORG_ADMIN or SUPER_ADMIN session; otherwise bounce to login. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user || (user.role !== "ORG_ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return user;
}

/** Require a SUPER_ADMIN session; org admins get bounced to their dashboard. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user || (user.role !== "ORG_ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  if (user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
