// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // API routes should always be allowed
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login";

  // Check if the user has an access token
  const hasAccessToken = request.cookies.has("spotify_access_token");

  // If the path requires authentication and the user doesn't have a token, redirect to login
  if (!isPublicPath && !hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If the user is authenticated and trying to access login, redirect to home
  if (isPublicPath && hasAccessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};