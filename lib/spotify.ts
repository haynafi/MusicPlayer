// Spotify API service

// Spotify API endpoints
const SPOTIFY_API = "https://api.spotify.com/v1"
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"

// Scopes for Spotify API access
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "user-top-read",
  "user-read-recently-played",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
  "streaming", // Add this scope for Web Playback SDK
]

// Generate a random string for state parameter
const generateRandomString = (length: number) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join("")
}

// Get the authorization URL for Spotify login
export const getAuthUrl = () => {
  const state = generateRandomString(16)

  // Store state in localStorage to verify later
  if (typeof window !== "undefined") {
    localStorage.setItem("spotify_auth_state", state)
  }

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "",
    state,
    scope: SCOPES.join(" "),
  })

  return `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`
}

// Exchange authorization code for access token
export const getAccessToken = async (code: string) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "",
  })

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: params.toString(),
  })

  return response.json()
}

// Refresh access token
export const refreshAccessToken = async (refreshToken: string) => {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  })

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: params.toString(),
  })

  return response.json()
}

// API request wrapper with token handling
export const spotifyFetch = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = localStorage.getItem("spotify_access_token")

  if (!accessToken) {
    throw new Error("No access token available")
  }

  const response = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  // Handle token expiration
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("spotify_refresh_token")

    if (refreshToken) {
      const tokenData = await refreshAccessToken(refreshToken)

      if (tokenData.access_token) {
        localStorage.setItem("spotify_access_token", tokenData.access_token)

        // Retry the request with the new token
        return spotifyFetch(endpoint, options)
      }
    }

    // If refresh failed, redirect to login
    window.location.href = "/login"
    throw new Error("Session expired")
  }

  return response.json()
}

// Get user profile
export const getUserProfile = async () => {
  return spotifyFetch("/me")
}

// Get user's playlists
export const getUserPlaylists = async (limit = 20, offset = 0) => {
  return spotifyFetch(`/me/playlists?limit=${limit}&offset=${offset}`)
}

// Get user's top tracks
export const getUserTopTracks = async (timeRange = "medium_term", limit = 20, offset = 0) => {
  return spotifyFetch(`/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`)
}

// Get user's recently played tracks
export const getRecentlyPlayed = async (limit = 20) => {
  return spotifyFetch(`/me/player/recently-played?limit=${limit}`)
}

// Get track information
export const getTrack = async (trackId: string) => {
  return spotifyFetch(`/tracks/${trackId}`)
}

// Get album information
export const getAlbum = async (albumId: string) => {
  return spotifyFetch(`/albums/${albumId}`)
}

// Get playlist information
export const getPlaylist = async (playlistId: string) => {
  return spotifyFetch(`/playlists/${playlistId}`)
}

// Search Spotify
export const searchSpotify = async (query: string, types = ["track", "artist", "album"], limit = 5) => {
  const typeParam = types.join(",")
  return spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=${typeParam}&limit=${limit}`)
}

// Get categories
export const getCategories = async (limit = 20, offset = 0) => {
  return spotifyFetch(`/browse/categories?limit=${limit}&offset=${offset}`)
}

// Get category playlists
export const getCategoryPlaylists = async (categoryId: string, limit = 20, offset = 0) => {
  return spotifyFetch(`/browse/categories/${categoryId}/playlists?limit=${limit}&offset=${offset}`)
}

// Playback control functions
export const playTrack = async (trackUri: string, deviceId?: string) => {
  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: [trackUri],
    }),
  }

  const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : "/me/player/play"
  return spotifyFetch(endpoint, options)
}

export const pausePlayback = async (deviceId?: string) => {
  const endpoint = deviceId ? `/me/player/pause?device_id=${deviceId}` : "/me/player/pause"
  return spotifyFetch(endpoint, { method: "PUT" })
}

export const nextTrack = async (deviceId?: string) => {
  const endpoint = deviceId ? `/me/player/next?device_id=${deviceId}` : "/me/player/next"
  return spotifyFetch(endpoint, { method: "POST" })
}

export const previousTrack = async (deviceId?: string) => {
  const endpoint = deviceId ? `/me/player/previous?device_id=${deviceId}` : "/me/player/previous"
  return spotifyFetch(endpoint, { method: "POST" })
}

export const seekToPosition = async (positionMs: number, deviceId?: string) => {
  const endpoint = deviceId 
    ? `/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}` 
    : `/me/player/seek?position_ms=${positionMs}`
  return spotifyFetch(endpoint, { method: "PUT" })
}

export const setVolume = async (volumePercent: number, deviceId?: string) => {
  const endpoint = deviceId 
    ? `/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}` 
    : `/me/player/volume?volume_percent=${volumePercent}`
  return spotifyFetch(endpoint, { method: "PUT" })
}

export const toggleShuffle = async (state: boolean, deviceId?: string) => {
  const endpoint = deviceId 
    ? `/me/player/shuffle?state=${state}&device_id=${deviceId}` 
    : `/me/player/shuffle?state=${state}`
  return spotifyFetch(endpoint, { method: "PUT" })
}

export const setRepeatMode = async (state: "track" | "context" | "off", deviceId?: string) => {
  const endpoint = deviceId 
    ? `/me/player/repeat?state=${state}&device_id=${deviceId}` 
    : `/me/player/repeat?state=${state}`
  return spotifyFetch(endpoint, { method: "PUT" })
}

// Get the current playback state
export const getPlaybackState = async () => {
  return spotifyFetch('/me/player')
}

// Transfer playback to another device
export const transferPlayback = async (deviceId: string, play: boolean = false) => {
  return spotifyFetch('/me/player', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play
    })
  })
}

// Get available devices
export const getAvailableDevices = async () => {
  return spotifyFetch('/me/player/devices')
}