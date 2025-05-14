import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const spotifyFetch = async (url: string, options: RequestInit = {}) => {
  // This is a placeholder implementation.
  // The actual implementation should make an API call.
  console.warn("spotifyFetch is a placeholder. Implement the actual API call.")
  return Promise.resolve({})
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
