/**
 * Centralized API configuration
 * Single source of truth for backend URLs and API keys
 */

const DEFAULT_API_URL = "http://localhost:9000";

function normalizeBaseUrl(url: string) {
	return url.trim().replace(/\/+$/, "");
}

function isDockerBridgeIp(hostname: string) {
	// Docker Desktop commonly allocates bridge networks in 172.16.0.0/12.
	// Those IPs are typically not reachable from the host on macOS.
	return /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

function resolveApiUrl() {
	const raw = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
	if (!raw) return DEFAULT_API_URL;

	const normalized = normalizeBaseUrl(raw);

	try {
		const parsed = new URL(normalized);
		if (isDockerBridgeIp(parsed.hostname)) {
			return DEFAULT_API_URL;
		}
	} catch {
		return DEFAULT_API_URL;
	}

	return normalized;
}

export const API_URL = resolveApiUrl();
export const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
