import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    disable: false,
    path: "/app",
    outDir: ".medusa/admin",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d", // Admin session expires in 7 days
    },
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server" || "shared",
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            // Cloudinary provider for product images
            resolve: "./src/modules/cloudinary",
            id: "cloudinary",
            options: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/meilisearch",
      options: {
        host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
        apiKey: process.env.MEILISEARCH_API_KEY,
      },
    },
    {
      resolve: "./src/modules/banner",
    },
    {
      resolve: "./src/modules/qpay",
      options: {
        clientId: process.env.QPAY_CLIENT_ID,
        clientSecret: process.env.QPAY_CLIENT_SECRET,
        invoiceCode: process.env.QPAY_INVOICE_CODE,
        callbackUrl: process.env.QPAY_CALLBACK_URL,
        isSandbox: process.env.QPAY_SANDBOX !== "false",
      },
    },
    {
      resolve: "./src/modules/email-notifications",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "./src/modules/trade_in",
    },
    {
      resolve: "./src/modules/product_analytics",
    },
    {
      resolve: "./src/modules/loyalty",
    },
    // Redis modules - only enabled when REDIS_URL is set
    ...(process.env.REDIS_URL ? [
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
      {
        resolve: "@medusajs/medusa/cache-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
          ttl: 30, // 30 seconds default TTL
        },
      },
      {
        resolve: "@medusajs/medusa/locking",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/locking-redis",
              id: "locking-redis",
              is_default: true,
              options: {
                redisUrl: process.env.REDIS_URL,
              },
            },
          ],
        },
      },
    ] : []),
  ],
})
