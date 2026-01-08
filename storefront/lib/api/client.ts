const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

/**
 * Gets headers for authenticated API requests
 * @param accessToken - User's access token
 * @returns Headers object with authentication
 */
export function getAuthHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Gets headers for public API requests
 * @returns Headers object with publishable key
 */
export function getPublicHeaders(): HeadersInit {
  return {
    "x-publishable-api-key": PUBLISHABLE_KEY,
  };
}

/**
 * Fetch options for authenticated requests
 * @param accessToken - User's access token
 * @returns Fetch options with credentials and auth headers
 */
export function getAuthFetchOptions(accessToken: string): RequestInit {
  return {
    credentials: "include",
    headers: getAuthHeaders(accessToken),
  };
}

/**
 * Fetch options for public requests
 * @returns Fetch options with publishable key
 */
export function getPublicFetchOptions(): RequestInit {
  return {
    headers: getPublicHeaders(),
  };
}

/**
 * Handles 401 unauthorized responses by redirecting to login
 * @param response - Fetch response
 * @returns true if was unauthorized and redirect happened
 */
export function handleUnauthorized(response: Response): boolean {
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return true;
  }
  return false;
}

/**
 * Fetch with retry logic for failed requests
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retries - Number of retries (default 3)
 * @param delay - Delay between retries in ms (default 1000)
 * @returns Response from fetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Don't retry client errors (4xx)
    if (response.status >= 400 && response.status < 500) {
      return response;
    }

    // Retry server errors (5xx) or network errors
    if (!response.ok && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Fetch with timeout
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default 10000)
 * @returns Response from fetch
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Creates an authenticated fetch function with token
 * @param accessToken - User's access token
 * @returns Function that performs authenticated fetches
 */
export function createAuthenticatedFetch(accessToken: string) {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        ...getAuthHeaders(accessToken),
      },
    });
  };
}

/**
 * Gets the full backend URL
 * @param path - API path
 * @returns Full URL to backend endpoint
 */
export function getBackendUrl(path: string): string {
  return `${BACKEND_URL}${path}`;
}
