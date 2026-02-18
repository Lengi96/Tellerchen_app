import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import { NextResponse } from "next/server";

// Edge-kompatible Middleware: Verwendet nur auth.config (ohne Prisma/bcrypt)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isLoginPage = nextUrl.pathname === "/login";
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isSettings = nextUrl.pathname.startsWith("/settings");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  const isApiTrpc = nextUrl.pathname.startsWith("/api/trpc");

  // API-Routes durchlassen
  if (isApiAuth || isApiTrpc) {
    return NextResponse.next();
  }

  // Eingeloggter User auf Login-Seite → Redirect zu Dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Nicht eingeloggt auf geschützter Route → Redirect zu Login
  if (!isLoggedIn && isDashboard) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Sicherheitshinweis: Settings-Seite nur für Admins zugänglich
  if (isSettings && isLoggedIn) {
    const role = req.auth?.user?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Root-URL → Redirect zu Dashboard oder Login
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
