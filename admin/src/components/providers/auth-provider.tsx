"use client";

import { createContext, useContext } from "react";

import { logout as apiLogout } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

type AuthContextValue = {
  user: SessionUser;
  isSuper: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const value: AuthContextValue = {
    user,
    isSuper: user.role === "SUPER_ADMIN",
    logout: async () => {
      await apiLogout();
      window.location.href = "/";
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
