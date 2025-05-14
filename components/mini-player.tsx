"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { useSpotify } from "@/context/spotify-context"

export function MiniPlayer() {
  const { currentTrack, isPlaying, playTrack, pauseTrack, nextTrack, previousTrack } = useSpotify()
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration_ms || 0)
    }
  }, [currentTrack])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            clearInterval(interval)
            return 0
          }
          return prev + 1000
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack()
    } else if (currentTrack) {
      playTrack(currentTrack.uri)
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseInt(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    // In a real implementation, we would call the Spotify API to set the volume
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setVolume(70) // Return to previous volume
    } else {
      setIsMuted(true)
      setVolume(0)
    }
    // In a real implementation, we would call the Spotify API to mute/unmute
  }

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center">
      <div className="flex items-center w-1/4">
        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden mr-3">
          <Image
            src={currentTrack.album?.images?.[0]?.url || "/placeholder.svg?height=48&width=48"}
            alt={currentTrack.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="truncate">
          <p className="font-medium text-sm truncate">{currentTrack.name}</p>
          <p className="text-xs text-gray-500 truncate">{currentTrack.artists?.map((a: any) => a.name).join(", ")}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center space-x-4 mb-1">
          <button onClick={previousTrack} className="p-1">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={handlePlayPause} className="p-2 bg-black rounded-full">
            {isPlaying ? <Pause className="h-3 w-3 text-white" /> : <Play className="h-3 w-3 text-white" />}
          </button>
          <button onClick={nextTrack} className="p-1">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        <div className="w-full flex items-center text-xs">
          <span className="w-8 text-right">{formatTime(progress)}</span>
          <div className="flex-1 mx-2 h-1 bg-gray-200 rounded-full">
            <div className="h-full bg-black rounded-full" style={{ width: `${(progress / duration) * 100}%` }}></div>
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="w-1/4 flex items-center justify-end">
        <button onClick={toggleMute} className="p-1 mr-2">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}
