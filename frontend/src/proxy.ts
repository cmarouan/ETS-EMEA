import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "AUTH_TOKEN";

function getBackendUrl() {
  const origin = (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000"
  ).replace(/\/$/, "");

  return origin.endsWith("/api") ? origin : `${origin}/api`;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE);

  return response;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token) {
    return isLoginPage ? NextResponse.next() : redirectToLogin(request);
  }

  try {
    const response = await fetch(`${getBackendUrl()}/me`, {
      headers: { Cookie: `${AUTH_COOKIE}=${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return isLoginPage ? NextResponse.next() : redirectToLogin(request);
    }

    if (isLoginPage) {
      return NextResponse.redirect(new URL("/sessions", request.url));
    }

    return NextResponse.next();
  } catch {
    return isLoginPage ? NextResponse.next() : redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/login", "/sessions/:path*", "/reservations/:path*", "/account/:path*"],
};
