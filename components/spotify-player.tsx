"use client"

import { useEffect, useState } from 'react'
import { useSpotify } from '@/context/spotify-context'

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export function SpotifyPlayer() {
  const { isAuthenticated, isPlaying } = useSpotify()
  const [player, setPlayer] = useState<any>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load Spotify Web Playback SDK script
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    // Initialize the player when SDK is ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'MUSIC2D Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          const token = localStorage.getItem('spotify_access_token')
          if (token) {
            cb(token)
          }
        },
        volume: 0.5
      })

      // Error handling
      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization error:', message)
      })
      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication error:', message)
      })
      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account error:', message)
      })
      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Playback error:', message)
      })

      // Playback status updates
      player.addListener('player_state_changed', (state: any) => {
        console.log('Player state changed:', state)
      })

      // Ready
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id)
        setDeviceId(device_id)
        // Store the device ID for use in other components
        localStorage.setItem('spotify_device_id', device_id)
      })

      // Not Ready
      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id)
      })

      // Connect to the player
      player.connect()
      setPlayer(player)
    }

    // Cleanup on unmount
    return () => {
      if (player) {
        player.disconnect()
      }
      if (script) {
        document.body.removeChild(script)
      }
      delete window.onSpotifyWebPlaybackSDKReady
    }
  }, [isAuthenticated])

  // Keep player active if playing
  useEffect(() => {
    if (player && deviceId) {
      const keepAlive = setInterval(() => {
        player.getCurrentState().then((state: any) => {
          if (!state) {
            player.connect()
          }
        })
      }, 5000)

      return () => clearInterval(keepAlive)
    }
  }, [player, deviceId])

  // This component doesn't render anything visible
  return null
}