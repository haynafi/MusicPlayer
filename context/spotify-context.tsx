"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  getAuthUrl,
  getAccessToken,
  getUserProfile,
  getUserPlaylists,
  getUserTopTracks,
  getRecentlyPlayed,
  pausePlayback,
  playTrack,
  nextTrack,
  previousTrack,
} from "@/lib/spotify"
import { spotifyFetch } from "@/lib/utils"

type SpotifyContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
  playlists: any[]
  topTracks: any[]
  recentTracks: any[]
  currentTrack: any
  isPlaying: boolean
  login: () => void
  logout: () => void
  fetchUserData: () => Promise<void>
  playTrack: (trackUri: string) => Promise<void>
  pauseTrack: () => Promise<void>
  nextTrack: () => Promise<void>
  previousTrack: () => Promise<void>
  playAlbum: (albumUri: string) => Promise<void>
  playArtistTopTracks: (artistId: string) => Promise<void>
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined)

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [playlists, setPlaylists] = useState<any[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for token in cookies
      const accessToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("spotify_access_token="))
        ?.split("=")[1];

      if (accessToken) {
        localStorage.setItem("spotify_access_token", accessToken); // Keep this for compatibility
        setIsAuthenticated(true);
        try {
          await fetchUserData();
        } catch (error) {
          console.error("Error fetching user data:", error);
          logout();
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    window.location.href = getAuthUrl();
  };

  const logout = () => {
    // Clear cookies
    document.cookie = "spotify_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "spotify_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    
    // Also clear localStorage
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    
    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    setPlaylists([]);
    setTopTracks([]);
    setRecentTracks([]);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true)

      // Fetch user profile
      const userProfile = await getUserProfile()
      setUser(userProfile)

      // Fetch user playlists
      const userPlaylists = await getUserPlaylists()
      setPlaylists(userPlaylists.items || [])

      // Fetch top tracks
      const userTopTracks = await getUserTopTracks()
      setTopTracks(userTopTracks.items || [])

      // Fetch recently played tracks
      const userRecentTracks = await getRecentlyPlayed()
      setRecentTracks(userRecentTracks.items?.map((item: any) => item.track) || [])

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setIsLoading(false)
      throw error
    }
  }

  const playSpotifyTrack = async (trackUri: string) => {
    try {
      await playTrack(trackUri)
      setIsPlaying(true)

      // Find the track in our lists to set as current
      const track = [...topTracks, ...recentTracks].find((t) => t.uri === trackUri)
      if (track) {
        setCurrentTrack(track)
      }
    } catch (error) {
      console.error("Error playing track:", error)
    }
  }

  const pauseSpotifyTrack = async () => {
    try {
      await pausePlayback()
      setIsPlaying(false)
    } catch (error) {
      console.error("Error pausing track:", error)
    }
  }

  const playNextTrack = async () => {
    try {
      await nextTrack()
      // We would need to poll for the current track to update currentTrack
    } catch (error) {
      console.error("Error playing next track:", error)
    }
  }

  const playPreviousTrack = async () => {
    try {
      await previousTrack()
      // We would need to poll for the current track to update currentTrack
    } catch (error) {
      console.error("Error playing previous track:", error)
    }
  }

  const playSpotifyAlbum = async (albumUri: string) => {
    try {
      await spotifyFetch("/me/player/play", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context_uri: albumUri,
        }),
      })
      setIsPlaying(true)
    } catch (error) {
      console.error("Error playing album:", error)
    }
  }

  const playSpotifyArtistTopTracks = async (artistId: string) => {
    try {
      // Get artist's top tracks
      const topTracks = await spotifyFetch(`/artists/${artistId}/top-tracks?market=from_token`)

      if (topTracks.tracks && topTracks.tracks.length > 0) {
        await spotifyFetch("/me/player/play", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: topTracks.tracks.slice(0, 10).map((track: any) => track.uri),
          }),
        })
        setIsPlaying(true)
        setCurrentTrack(topTracks.tracks[0])
      }
    } catch (error) {
      console.error("Error playing artist top tracks:", error)
    }
  }

  const value = {
    isAuthenticated,
    isLoading,
    user,
    playlists,
    topTracks,
    recentTracks,
    currentTrack,
    isPlaying,
    login,
    logout,
    fetchUserData,
    playTrack: playSpotifyTrack,
    pauseTrack: pauseSpotifyTrack,
    nextTrack: playNextTrack,
    previousTrack: playPreviousTrack,
    playAlbum: playSpotifyAlbum,
    playArtistTopTracks: playSpotifyArtistTopTracks,
  }

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>
}

export const useSpotify = () => {
  const context = useContext(SpotifyContext)
  if (context === undefined) {
    throw new Error("useSpotify must be used within a SpotifyProvider")
  }
  return context
}
