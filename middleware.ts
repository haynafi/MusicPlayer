// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For now, let's simplify the middleware for debugging purposes
  // We'll rely on client-side redirection in the context provider
  return NextResponse.next()
}

// Matcher config if you want to reimplement middleware protection later
export const config = {
  matcher: ['/protected/:path*'],
};