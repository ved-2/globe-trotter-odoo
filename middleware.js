import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/create-trip(.*)",
  "/travel-plan(.*)",
  "/trips(.*)",
  "/community(.*)",
  
]);

export default clerkMiddleware(async (auth, req) => {
  // Don't protect API routes - let them handle their own authentication
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
