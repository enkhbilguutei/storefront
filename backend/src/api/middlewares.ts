import { defineMiddlewares } from "@medusajs/medusa";
import { validateAndTransformQuery } from "@medusajs/framework/http";
import { customAuthMiddleware } from "./auth-middleware";

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
      middlewares: [customAuthMiddleware],
    },
    {
      matcher: "/store/custom/addresses*",
      middlewares: [customAuthMiddleware],
    },
    {
      matcher: "/store/custom/orders",
      middlewares: [customAuthMiddleware],
    },
    {
      matcher: "/store/wishlist*",
      middlewares: [customAuthMiddleware],
    },
    {
      matcher: "/store/loyalty*",
      middlewares: [customAuthMiddleware],
    },
  ],
});
