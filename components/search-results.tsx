"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { searchSpotify } from "@/lib/spotify"
import { useSpotify } from "@/context/spotify-context"

type SearchResult = {
  id: string
  name: string
  type: "track" | "artist" | "album"
  imageUrl: string
  uri: string
  artists?: { name: string }[]
  album?: { name: string }
}

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { playTrack } = useSpotify()

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await searchSpotify(query)

        const tracks =
          data.tracks?.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            type: "track" as const,
            imageUrl: track.album?.images?.[0]?.url || "",
            uri: track.uri,
            artists: track.artists,
            album: { name: track.album?.name },
          })) || []

        const artists =
          data.artists?.items.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            type: "artist" as const,
            imageUrl: artist.images?.[0]?.url || "",
            uri: artist.uri,
          })) || []

        const albums =
          data.albums?.items.map((album: any) => ({
            id: album.id,
            name: album.name,
            type: "album" as const,
            imageUrl: album.images?.[0]?.url || "",
            uri: album.uri,
            artists: album.artists,
          })) || []

        // Combine and limit results
        setResults([...tracks.slice(0, 5), ...artists.slice(0, 3), ...albums.slice(0, 3)])
      } catch (error) {
        console.error("Error searching Spotify:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimeout = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounceTimeout)
  }, [query])

  const handlePlay = async (result: SearchResult) => {
    if (result.type === "track") {
      await playTrack(result.uri)
    } else {
      // For artists and albums, we would need to get their top tracks first
      console.log(`Playing ${result.type}: ${result.name}`)
    }
  }

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10">
        <div className="flex items-center justify-center py-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (results.length === 0 && query.length >= 2) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10">
        <div className="text-center py-4 text-gray-500">No results found</div>
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-10 max-h-96 overflow-y-auto">
      {/* Tracks */}
      {results.filter((r) => r.type === "track").length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2 text-gray-500">TRACKS</h3>
          {results
            .filter((result) => result.type === "track")
            .map((result) => (
              <div
                key={result.id}
                className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => handlePlay(result)}
              >
                <div className="w-10 h-10 mr-3 bg-gray-200 rounded overflow-hidden">
                  {result.imageUrl ? (
                    <Image
                      src={result.imageUrl || "/placeholder.svg"}
                      alt={result.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-xs">🎵</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.artists?.map((a) => a.name).join(", ")} • {result.album?.name}
                  </p>
                </div>
                <button className="ml-2 p-2 rounded-full hover:bg-gray-200">
                  <Play className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Artists */}
      {results.filter((r) => r.type === "artist").length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2 text-gray-500">ARTISTS</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {results
              .filter((result) => result.type === "artist")
              .map((result) => (
                <div
                  key={result.id}
                  className="flex flex-col items-center w-24 cursor-pointer"
                  onClick={() => handlePlay(result)}
                >
                  <div className="w-20 h-20 mb-2 bg-gray-200 rounded-full overflow-hidden">
                    {result.imageUrl ? (
                      <Image
                        src={result.imageUrl || "/placeholder.svg"}
                        alt={result.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-xs">👤</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center truncate w-full">{result.name}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Albums */}
      {results.filter((r) => r.type === "album").length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2 text-gray-500">ALBUMS</h3>
          <div className="grid grid-cols-3 gap-3">
            {results
              .filter((result) => result.type === "album")
              .map((result) => (
                <div key={result.id} className="cursor-pointer" onClick={() => handlePlay(result)}>
                  <div className="aspect-square bg-gray-200 rounded overflow-hidden mb-1">
                    {result.imageUrl ? (
                      <Image
                        src={result.imageUrl || "/placeholder.svg"}
                        alt={result.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-xs">💿</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{result.name}</p>
                  <p className="text-xs text-gray-500 truncate">{result.artists?.map((a) => a.name).join(", ")}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
