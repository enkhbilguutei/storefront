import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production for distributed systems)
const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware factory
 * 
 * Usage in route:
 * ```
 * import { createRateLimiter } from "../../middlewares/rate-limit";
 * 
 * const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 10 });
 * 
 * export async function GET(req: MedusaRequest, res: MedusaResponse) {
 *   const rateLimitResult = await limiter(req, res);
 *   if (rateLimitResult) return rateLimitResult; // Rate limit exceeded
 *   
 *   // Your route logic here
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (
    req: MedusaRequest,
    res: MedusaResponse
  ): Promise<void | Response> => {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
    
    // Get identifier (IP address or authenticated user ID)
    const identifier = 
      (req as any).auth_context?.actor_id ||
      req.headers["x-forwarded-for"] as string ||
      req.socket?.remoteAddress ||
      "unknown";

    const key = `ratelimit:${identifier}:${req.url}`;
    const now = Date.now();

    // Get or initialize rate limit data
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    store[key].count++;

    // Check if rate limit exceeded
    if (store[key].count > config.maxRequests) {
      const resetIn = Math.ceil((store[key].resetTime - now) / 1000);
      
      logger.warn(`Rate limit exceeded for ${identifier} on ${req.url}`);
      
      return res.status(429).json({
        error: config.message || "Too many requests. Please try again later.",
        retryAfter: resetIn,
      }) as any;
    }

    // Add rate limit headers
    res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", (config.maxRequests - store[key].count).toString());
    res.setHeader("X-RateLimit-Reset", store[key].resetTime.toString());

    return; // Continue to route handler
  };
}

// Predefined rate limiters for common use cases
export const rateLimiters = {
  // Very strict - for auth endpoints
  strict: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Хэт олон оролдлого хийлээ. 15 минутын дараа дахин оролдоно уу.",
  }),

  // Moderate - for write operations (reviews, wishlist)
  moderate: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: "Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.",
  }),

  // Lenient - for read operations (search, product views)
  lenient: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: "Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.",
  }),

  // Special for search
  search: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: "Хайлт хэт олон удаа хийлээ. Түр хүлээгээд дахин оролдоно уу.",
  }),
};

/**
 * Redis-based rate limiter (for production use)
 * Requires REDIS_URL environment variable
 * 
 * TODO: Implement Redis-based rate limiting for distributed systems
 * This would use Redis INCR with EXPIRE for atomic operations
 */
export async function createRedisRateLimiter(config: RateLimitConfig) {
  // Implementation would use Redis here
  // For now, falls back to in-memory
  return createRateLimiter(config);
}
