import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the token from the session cookie
  const token = request.cookies.get("next-auth.session-token")?.value;
  console.log("request.nextUrl.pathname: ", request.nextUrl.pathname);
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

  if (token) {
    // User is authenticated
    if (isAuthPage) {
      // Redirect to home if trying to access auth pages while logged in
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // User is not authenticated
    if (!isAuthPage) {
      // Redirect to login if trying to access protected pages while logged out
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/auth/:path*"],
};
