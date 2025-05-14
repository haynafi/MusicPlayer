import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SpotifyProvider } from "@/context/spotify-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MUSIC2D",
  description: "A retro-styled music player interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SpotifyProvider>{children}</SpotifyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
