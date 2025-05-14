"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSpotify } from "@/context/spotify-context"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useSpotify()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ fontFamily: "monospace" }}>
          MUSIC2D
        </h1>

        <p className="mb-8 text-center text-gray-700">
          Connect with your Spotify account to access your music library and playlists.
        </p>

        <Button
          onClick={login}
          className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-full"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Connect with Spotify"}
        </Button>
      </div>
    </div>
  )
}
