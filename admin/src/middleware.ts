import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Cheap cookie-presence gate for the dashboard. Real enforcement happens in
// the API (role guards) and in lib/session.ts (requireAdmin per layout/page).
export function middleware(request: NextRequest) {
  const hasSession =
    request.cookies.has("Authentication") || request.cookies.has("Refresh");

  if (!hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
