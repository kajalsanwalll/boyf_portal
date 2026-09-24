import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isAdminRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // Not logged in
  if (!userId) {
    return NextResponse.redirect(
      new URL("/sign-in", req.url)
    );
  }

  const role = sessionClaims?.metadata?.role;

  // Logged in but not an admin
  if (role !== "ADMIN") {
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|woff2?|ttf|map|txt|xml|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};