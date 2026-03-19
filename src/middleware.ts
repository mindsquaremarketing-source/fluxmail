import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "shopify_app_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /app/* routes
  if (!pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    const authUrl = new URL("/api/auth", request.url);

    // Preserve shop param if present
    const shop = request.nextUrl.searchParams.get("shop");
    if (shop) {
      authUrl.searchParams.set("shop", shop);
    }

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
