import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-shared";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  if (pathname.startsWith("/admin")) {
    if (!session) return redirectToLogin(request);
    if (session.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    if (!session) return redirectToLogin(request);
    return NextResponse.next();
  }

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL(session.role === "admin" ? "/admin" : "/account", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*", "/login"] };
