/**
 * Centralized API configuration
 * Single source of truth for backend URLs and API keys
 */

export const API_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
export const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
