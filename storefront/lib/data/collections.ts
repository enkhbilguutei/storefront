import { cache } from "react"
import { API_KEY, API_URL } from "@/lib/config/api"

export interface Collection {
  id: string
  title: string
  handle: string
  metadata?: Record<string, unknown> | null
}

const BACKEND_URL = API_URL
const PUBLISHABLE_KEY = API_KEY
const FETCH_TIMEOUT_MS = 2000

export const getCollections = cache(async (): Promise<Collection[]> => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/store/collections?limit=100&fields=id,title,handle,metadata`,
      {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`)
    }

    const data = await response.json()
    return (data?.collections ?? []) as Collection[]
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return []
  }
})

export const getCollectionByHandle = cache(async (handle: string): Promise<Collection | null> => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/store/collections?handle=${encodeURIComponent(handle)}&fields=id,title,handle,metadata`,
      {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.statusText}`)
    }

    const data = await response.json()
    const collections = (data?.collections ?? []) as Collection[]
    return collections[0] ?? null
  } catch (error) {
    console.error("Failed to fetch collection:", error)
    return null
  }
})
