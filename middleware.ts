import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow access to the login page always
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Allow access to OTP verify page (requires OTP cookie, checked in the page itself via API)
  if (pathname === "/admin/verify-otp") {
    // Must have an OTP cookie to be on this page
    const otpCookie = req.cookies.get("admin_otp");
    if (!otpCookie?.value) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Allow API routes to pass through
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("admin_session");

  if (!sessionCookie?.value) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Validate the session cookie contains the correct secret
  try {
    const decoded = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );
    const authSecret = process.env.AUTH_SECRET;

    if (!authSecret || decoded.secret !== authSecret) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
      return response;
    }
  } catch {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
