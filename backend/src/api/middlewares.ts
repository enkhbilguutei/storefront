import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformQuery } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      // Allow unauthenticated access to search
      matcher: "/store/search",
      middlewares: [],
    },
    {
      // Allow unauthenticated access to banners (public CMS content)
      matcher: "/store/banners",
      middlewares: [],
    },
    {
      // Allow unauthenticated access to warm endpoint (connection warmup)
      matcher: "/store/warm",
      middlewares: [],
    },
    {
      // Allow unauthenticated access to QPay endpoints
      matcher: "/store/qpay",
      middlewares: [],
    },
    {
      // QPay invoice creation
      matcher: "/store/qpay/create-invoice",
      middlewares: [],
    },
    {
      // QPay callback endpoint (called by QPay)
      matcher: "/store/qpay/callback",
      middlewares: [],
    },
    {
      // QPay payment status check
      matcher: "/store/qpay/check-payment/*",
      middlewares: [],
    },
    {
      matcher: "/store/custom/me",
      middlewares: [
        async (req, res, next) => {
          const authHeader = req.headers.authorization;
          if (authHeader) {
            const token = authHeader.split(" ")[1];
            const jwtModule = await import("jsonwebtoken");
            const verify = jwtModule.verify || (jwtModule.default as any)?.verify;
            try {
              const secret = process.env.JWT_SECRET || "supersecret";
              const decoded = verify(token, secret);
              
              // Manually populate auth_context
              (req as any).auth_context = {
                actor_id: decoded.actor_id,
                auth_identity_id: decoded.auth_identity_id,
                app_metadata: decoded.app_metadata,
                scope: decoded.scope
              };
            } catch (e) {
              console.error("[Auth] Token verification failed:", e.message);
            }
          }
          next();
        }
      ],
    },
    {
      matcher: "/store/custom/addresses*",
      middlewares: [
        async (req, res, next) => {
          const authHeader = req.headers.authorization;
          if (authHeader) {
            const token = authHeader.split(" ")[1];
            const jwtModule = await import("jsonwebtoken");
            const verify = jwtModule.verify || (jwtModule.default as any)?.verify;
            try {
              const secret = process.env.JWT_SECRET || "supersecret";
              const decoded = verify(token, secret);
              
              (req as any).auth_context = {
                actor_id: decoded.actor_id,
                auth_identity_id: decoded.auth_identity_id,
                app_metadata: decoded.app_metadata,
                scope: decoded.scope
              };
            } catch (e) {
              console.error("[Auth] Token verification failed:", e.message);
            }
          }
          next();
        }
      ],
    },
    {
      matcher: "/store/custom/orders",
      middlewares: [
        async (req, res, next) => {
          const authHeader = req.headers.authorization;
          if (authHeader) {
            const token = authHeader.split(" ")[1];
            const jwtModule = await import("jsonwebtoken");
            const verify = jwtModule.verify || (jwtModule.default as any)?.verify;
            try {
              const secret = process.env.JWT_SECRET || "supersecret";
              const decoded = verify(token, secret);
              
              // Manually populate auth_context
              (req as any).auth_context = {
                actor_id: decoded.actor_id,
                auth_identity_id: decoded.auth_identity_id,
                app_metadata: decoded.app_metadata,
                scope: decoded.scope
              };
            } catch (e) {
              // Token verification failed
            }
          }
          next();
        }
      ],
    },
  ],
});
