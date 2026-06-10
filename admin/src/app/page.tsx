"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe, isAdminRole, login, logout, refreshSession, verify2fa } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If a session already exists (or can be silently refreshed), skip login.
  useEffect(() => {
    void (async () => {
      const me = await getMe();
      if (me && isAdminRole(me)) {
        router.replace("/dashboard");
        return;
      }
      if (!me && (await refreshSession())) {
        const refreshed = await getMe();
        if (refreshed && isAdminRole(refreshed)) router.replace("/dashboard");
      }
    })();
  }, [router]);

  const finishLogin = async () => {
    const me = await getMe();

    if (!me || !isAdminRole(me)) {
      await logout();
      setStep("credentials");
      setError("This account is not authorized for the admin panel.");
      return;
    }

    router.push("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(identifier, password);

      if (result.status === "2fa_required") {
        setStep("2fa");
      } else {
        await finishLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verify2fa(code);
      await finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-brand focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Resume Space" className="mx-auto h-14 w-auto" />
          <p className="mt-3 text-sm text-zinc-500">Partner &amp; Admin Portal</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="brand-hairline h-1" />
          <div className="p-6">
          {step === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="identifier" className="text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="you@organization.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-md bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2fa} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="code" className="text-sm font-medium text-zinc-700">
                  Two-factor code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                  className={inputClass}
                />
                <p className="text-xs text-zinc-500">
                  Enter the code from your authenticator app.
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-md bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-900"
              >
                Back to sign in
              </button>
            </form>
          )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Organization accounts are issued by the Resume Space team.
        </p>
      </div>
    </div>
  );
}
