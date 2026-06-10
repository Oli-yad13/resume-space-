"use client";

// Thin fetch wrapper for the backend API. All calls go to the relative
// /api/... path, which next.config.ts proxies to the NestJS server — so the
// httpOnly auth cookies are first-party and sent automatically.
//
// On a 401 the wrapper tries one silent token refresh and retries the
// request; a second 401 sends the user back to the login page.

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const extractMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { message?: string | string[]; error?: string };
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    return message ?? body.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

let refreshPromise: Promise<boolean> | null = null;

const tryRefresh = (): Promise<boolean> => {
  // De-duplicate concurrent refreshes.
  refreshPromise ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

export const api = async <T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> => {
  const { json, ...init } = options;

  const doFetch = () =>
    fetch(path, {
      ...init,
      headers: {
        ...(json === undefined ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
      },
      body: json === undefined ? init.body : JSON.stringify(json),
    });

  let response = await doFetch();

  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await doFetch();
    }

    if (response.status === 401) {
      window.location.href = "/";
      throw new ApiError(401, "Session expired");
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractMessage(response));
  }

  // Some endpoints return empty bodies.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
};

export { ApiError };
