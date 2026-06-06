"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { isAuthenticated, login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (login(email, password)) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Left Section - Branding */}
      <div className="relative hidden w-1/2 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative z-10 max-w-md space-y-8 px-8 text-center">
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-2xl">
              <span className="text-2xl font-bold text-zinc-900">RS</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Resume Space</h1>
            <div className="mx-auto mt-4 h-0.5 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <p className="mt-4 text-sm font-medium uppercase tracking-wider text-white/50">
              Admin Dashboard
            </p>
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            Manage users, resumes, and analytics with a powerful admin interface
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="text-center lg:hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 shadow-lg">
              <span className="text-lg font-bold text-white">RS</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900">Resume Space</h1>
            <p className="mt-1 text-sm font-medium text-zinc-500">Admin Dashboard</p>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
            <p className="mt-2 text-sm text-zinc-600">Sign in to access the admin dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-zinc-900">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm transition-all placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-zinc-900">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="flex h-11 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm transition-all placeholder:text-zinc-400 hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {error && (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-base font-semibold shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Temporary Auth Notice */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Local Development
                </p>
                <p className="mt-1.5 text-sm font-medium text-zinc-900">
                  Set admin login values in local environment variables.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400">
            © 2025 Resume Space. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
