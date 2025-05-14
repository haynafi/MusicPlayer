import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, request.url))
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || "",
      }).toString(),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.redirect(new URL(`/login?error=${tokenData.error}`, request.url))
    }

    // Create a response that redirects to the home page
    const response = NextResponse.redirect(new URL("/", request.url))
    
    // Set cookies with the tokens
    response.cookies.set("spotify_access_token", tokenData.access_token, {
      httpOnly: false, // Allow JavaScript access
      maxAge: tokenData.expires_in,
      path: "/",
    })
    
    response.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
      httpOnly: false, // Allow JavaScript access
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    return NextResponse.redirect(new URL(`/login?error=token_exchange_failed`, request.url))
  }
}