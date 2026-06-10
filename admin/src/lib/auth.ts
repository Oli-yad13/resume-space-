"use client";

// Real authentication against the NestJS backend (proxied through /api).
// Sessions are httpOnly cookies set by the server — nothing is stored in
// localStorage; the admin role check happens via GET /api/user/me.

import { api } from "./api";
import type { SessionUser } from "./types";

export type LoginResult =
  | { status: "authenticated"; user: SessionUser }
  | { status: "2fa_required" };

export async function login(identifier: string, password: string): Promise<LoginResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return (await response.json()) as LoginResult;
}

export async function verify2fa(code: string): Promise<SessionUser> {
  const response = await fetch("/api/auth/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error("Invalid two-factor code.");
  }

  return (await response.json()) as SessionUser;
}

export async function getMe(): Promise<SessionUser | null> {
  try {
    return await api<SessionUser>("/api/user/me");
  } catch {
    return null;
  }
}

/** Silently refresh the session cookie. Returns true if a session exists. */
export async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", { method: "POST" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore — cookies are cleared server-side; worst case they expire.
  }
}

export function isAdminRole(user: SessionUser | null): boolean {
  return user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN";
}
