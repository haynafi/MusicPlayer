// app/api/spotify/callback/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL(`/login`, request.url))
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
      return NextResponse.redirect(new URL(`/login`, request.url))
    }

    // Redirect to the frontend with the tokens in URL parameters
    // This is not ideal for security but simplifies the implementation
    return NextResponse.redirect(
      new URL(`/?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}`, request.url),
    )
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    return NextResponse.redirect(new URL(`/login`, request.url))
  }
}