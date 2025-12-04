import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    // If user is not authenticated and trying to access protected route
    if (!req.nextauth.token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes - checkout allows guest access
export const config = {
  matcher: [
    "/account/:path*",
  ],
};
