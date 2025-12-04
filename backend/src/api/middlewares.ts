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
  ],
});
