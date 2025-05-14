"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useSpotify } from "@/context/spotify-context"

export function RecentlyPlayed() {
  const { recentTracks, playTrack } = useSpotify()

  if (!recentTracks || recentTracks.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-center">No recently played tracks</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "monospace" }}>
        Recently Played
      </h3>
      <div className="space-y-2">
        {recentTracks.slice(0, 5).map((track: any) => (
          <div
            key={`${track.id}-${Date.now()}`}
            className="flex items-center p-2 hover:bg-gray-200 rounded-md cursor-pointer"
            onClick={() => playTrack(track.uri)}
          >
            <div className="w-10 h-10 mr-3 bg-gray-200 rounded overflow-hidden">
              <Image
                src={track.album?.images?.[0]?.url || "/placeholder.svg?height=40&width=40"}
                alt={track.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{track.name}</p>
              <p className="text-xs text-gray-500 truncate">{track.artists?.map((a: any) => a.name).join(", ")}</p>
            </div>
            <button className="ml-2 p-1 rounded-full hover:bg-gray-300">
              <Play className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
