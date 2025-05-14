"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Mail, Bell, Shuffle, SkipBack, Pause, Play, SkipForward, Repeat } from "lucide-react"
import { useSpotify } from "@/context/spotify-context"
import { SearchResults } from "@/components/search-results"
import { MiniPlayer } from "@/components/mini-player"
import { RecentlyPlayed } from "@/components/recently-played"

export default function Home() {
  const router = useRouter()
  const {
    isAuthenticated,
    isLoading,
    user,
    playlists,
    topTracks,
    recentTracks,
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    nextTrack,
    previousTrack,
  } = useSpotify()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [categories, setCategories] = useState([
    { id: "classic", name: "Classic" },
    { id: "90s", name: "90s" },
    { id: "new", name: "New" },
    { id: "instrumental", name: "Instrumental" },
    { id: "modern", name: "Modern playlist" },
  ])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Update progress bar
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            clearInterval(interval)
            return 0
          }
          return prev + 1000
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, duration])

  // Set duration when current track changes
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration_ms)
      setCurrentTime(0)
    }
  }, [currentTrack])

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack()
    } else if (currentTrack) {
      playTrack(currentTrack.uri)
    } else if (topTracks.length > 0) {
      playTrack(topTracks[0].uri)
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  const displayedTrack = currentTrack || (topTracks.length > 0 ? topTracks[0] : null)
  const featuredPlaylists = playlists.slice(0, 3)
  const favoritePlaylists = playlists.slice(0, 4)

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Sidebar */}
      <div className="w-20 bg-gray-200 border-r border-gray-300 flex flex-col items-center py-6 space-y-10">
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="black" strokeWidth="2" />
          </svg>
        </div>
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              stroke="gray"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path
              d="M9 18V5l12 13V5M3 8v8"
              stroke="gray"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle cx="12" cy="12" r="10" stroke="gray" strokeWidth="2" />
            <path d="M12 8v8M8 12h8" stroke="gray" strokeWidth="2" />
          </svg>
        </div>
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path d="M20 12V8H6a2 2 0 100 4h12v4H6a2 2 0 100 4h14v-4a4 4 0 000-8v4" stroke="gray" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <div className="font-bold text-2xl tracking-tight" style={{ fontFamily: "monospace" }}>
            MUSIC2D
          </div>
          <div className="relative w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for songs, artists"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-200 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
            {showSearchResults && searchQuery.length >= 2 && <SearchResults query={searchQuery} />}
          </div>
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-gray-700" />
            <Bell className="h-5 w-5 text-gray-700" />
            <div className="h-8 w-8 bg-gray-300 rounded-md overflow-hidden">
              {user?.images?.[0]?.url ? (
                <Image
                  src={user.images[0].url || "/placeholder.svg"}
                  alt={user.display_name || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="flex items-center justify-center h-full w-full text-xs">👤</span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-4">
          <div className="flex">
            {/* Turntable Section */}
            <div className="w-1/2 pr-8">
              <div className="relative mb-6">
                {displayedTrack ? (
                  <>
                    <div className="relative">
                      <Image
                        src={displayedTrack.album?.images?.[0]?.url || "/placeholder.svg?height=400&width=400"}
                        alt={displayedTrack.name}
                        width={400}
                        height={400}
                        className="w-full rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-full bg-black flex items-center justify-center">
                          <div className="w-1/4 h-1/4 rounded-full bg-white"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "monospace" }}>
                        {displayedTrack.name}
                      </h2>
                      <span className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm">
                        {displayedTrack.album?.album_type || "Track"}
                      </span>
                    </div>
                    <div className="flex items-center mt-6">
                      <span className="text-sm mr-2">{formatTime(currentTime)}</span>
                      <div className="flex-1 h-6 mx-2">
                        <div className="relative h-full">
                          <div className="absolute inset-y-0 w-full flex items-center">
                            <div className="h-1 bg-gray-300 w-full rounded-full">
                              <div
                                className="h-full bg-black rounded-full"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="absolute inset-y-0 w-full flex items-center pointer-events-none">
                            {Array.from({ length: 50 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-${i % 3 === 0 ? "5" : i % 2 === 0 ? "3" : "2"} w-1 mx-0.5 ${i < 20 ? "bg-black" : "bg-gray-400"}`}
                                style={{
                                  height: `${(i % 3 === 0 ? 20 : i % 2 === 0 ? 12 : 8) * (i < 20 ? 1 : 0.7)}px`,
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm ml-2">{formatTime(duration)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-300 rounded-lg">
                    <p className="text-gray-600">No track selected</p>
                  </div>
                )}
                <div className="flex justify-between items-center mt-8">
                  <button className="p-2">
                    <Shuffle className="h-6 w-6" />
                  </button>
                  <button className="p-2" onClick={previousTrack}>
                    <SkipBack className="h-6 w-6" />
                  </button>
                  <button className="p-4 bg-black rounded-full" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
                  </button>
                  <button className="p-2" onClick={nextTrack}>
                    <SkipForward className="h-6 w-6" />
                  </button>
                  <button className="p-2">
                    <Repeat className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="w-1/2">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-4xl font-bold" style={{ fontFamily: "monospace" }}>
                    Music
                    <br />
                    Categories
                  </h2>
                  <a href="#" className="text-sm underline">
                    View all
                  </a>
                </div>
                <div className="flex space-x-2 mb-6 overflow-x-auto">
                  {categories.map((category) => (
                    <span
                      key={category.id}
                      className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm whitespace-nowrap"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {featuredPlaylists.map((playlist) => (
                    <div key={playlist.id} className="space-y-2">
                      <div
                        className="aspect-square bg-gray-300 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => {
                          // In a real app, we would fetch and play the first track of the playlist
                          console.log("Play playlist:", playlist.name)
                        }}
                      >
                        <Image
                          src={playlist.images?.[0]?.url || "/placeholder.svg?height=150&width=150"}
                          alt={playlist.name}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-bold">{playlist.name}</h3>
                      <p className="text-xs text-gray-600">by {playlist.owner?.display_name || "Unknown"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "monospace" }}>
                    Favorite Playlists ({favoritePlaylists.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {favoritePlaylists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={playlist.images?.[0]?.url || "/placeholder.svg?height=64&width=64"}
                          alt={playlist.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{playlist.name}</h3>
                        <p className="text-xs text-gray-600">{playlist.tracks?.total || 0} songs in this list</p>
                      </div>
                      <button
                        className="h-10 w-10 rounded-full border border-gray-400 flex items-center justify-center"
                        onClick={() => {
                          // In a real app, we would fetch and play the first track of the playlist
                          console.log("Play playlist:", playlist.name)
                        }}
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Recently Played section */}
              <RecentlyPlayed />
            </div>
          </div>
        </main>
      </div>
      {/* Add MiniPlayer at the bottom */}
      <MiniPlayer />
    </div>
  )
}
