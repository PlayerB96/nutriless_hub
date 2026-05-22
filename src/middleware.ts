import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  if (pathname === "/api/auth/callback/credentials") {
    const ip = getClientIp(request);
    if (!checkRateLimit(`login:${ip}`)) {
      const errorUrl = new URL("/api/auth/error", request.url);
      errorUrl.searchParams.set("error", "TooManyRequests");
      // NextAuth en el cliente espera `url` en JSON; sin ella, signIn() lanza TypeError.
      return NextResponse.json(
        {
          url: errorUrl.toString(),
          error: "Demasiados intentos. Intenta más tarde.",
        },
        { status: 429 },
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname === "/home" ||
    pathname === "/settings";

  if (!isApiRoute && !isProtectedPage) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    if (isApiRoute) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const tokenUserId = String(token.id);

  const dashboardMatch = pathname.match(/^\/dashboard\/(\d+)/);
  if (dashboardMatch && tokenUserId !== dashboardMatch[1]) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }
    return NextResponse.redirect(
      new URL(`/dashboard/${tokenUserId}`, request.url),
    );
  }

  const apiUserMatch = pathname.match(/^\/api\/users\/(\d+)/);
  if (apiUserMatch && tokenUserId !== apiUserMatch[1]) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/callback/credentials",
    "/api/:path*",
    "/dashboard/:path*",
    "/home",
    "/settings",
  ],
};
