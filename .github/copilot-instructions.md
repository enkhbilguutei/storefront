# Alimhan E-commerce Project Instructions

## ⚠️ Critical Rules

- **NEVER restart dev servers** - User manages servers manually; watch terminal for errors
- **Mongolian UI** - All user-facing text in Cyrillic (see Localization section)
- **Use pnpm** - This is a pnpm workspace (see `pnpm-workspace.yaml`)

## Architecture

**Monorepo**: pnpm + Turbo (`turbo.json`)
- `backend/` - Medusa v2 headless commerce (port 9000)
- `storefront/` - Next.js 15 with App Router (port 3000)

**Data Flow**: 
```
Storefront → Medusa JS SDK (lib/medusa.ts) → Backend API → PostgreSQL
            ↘ Zustand stores (lib/store.ts) for client state
```

**Custom Modules** (in `backend/src/modules/`):
- `meilisearch/` - Product search (auto-synced via `subscribers/product-search-sync.ts`)
- `banner/` - Homepage banners with placements
- `cloudinary/` - Image uploads (configured in `medusa-config.ts`)

## Commands

```bash
pnpm dev                                    # Both services via Turbo
cd backend && pnpm seed                     # Seed Mongolian products/MNT
cd backend && medusa exec ./src/scripts/create-admin.ts  # Admin user
cd backend && pnpm test:integration:http    # Backend tests
```

## Backend Patterns (Medusa v2)

**API Routes** - Use scoped resolution for services:
```typescript
// backend/src/api/store/[endpoint]/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve("moduleName"); // DI container
}
```

**Scripts** - Export default async with `ExecArgs`:
```typescript
// backend/src/scripts/*.ts
import { ExecArgs } from "@medusajs/framework/types";
export default async function({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
}
```

**Workflows** - Import from `@medusajs/medusa/core-flows` (see `seed.ts` for examples).

**Subscribers** - Event handlers for cross-module sync (e.g., `product-search-sync.ts`).

## Storefront Patterns (Next.js)

**State** - Zustand with persistence (`lib/store.ts`):
- `useCartStore` - Cart with optimistic updates, server sync, deduplication
- `useUserStore` - Auth state synced with NextAuth

**Data Fetching** - Use `cache()` from React for server-side (see `lib/data/categories.ts`):
```typescript
import { cache } from "react";
export const getData = cache(async () => { ... });
```

**Auth** - NextAuth + Medusa backend (`app/api/auth/[...nextauth]/route.ts`):
- Credentials provider authenticates against `/auth/customer/emailpass`
- Google OAuth supported
- Use `getSession()` from `lib/auth.ts` for server components

**Forms** - Zod schemas in `lib/validations.ts` (includes Mongolian error messages for checkout)

**Images** - `CloudinaryImage` component handles Cloudinary URLs, public IDs, and fallbacks

**Checkout** - Multi-step flow in `lib/checkout/useCheckout.ts` with form reducer pattern

## Localization

- **Language**: Mongolian (mn) - UI in Cyrillic
- **Currency**: MNT (₮)
- **Country**: MN

```typescript
// Price formatting
new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT" }).format(amount)

// Mongolian validation messages (see lib/validations.ts)
z.string().min(1, "Нэр оруулна уу")
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/medusa-config.ts` | Module registration, Redis/Cloudinary config |
| `backend/src/scripts/seed.ts` | Demo data seeding workflow |
| `storefront/lib/store.ts` | Zustand stores with cart/user state |
| `storefront/lib/checkout/useCheckout.ts` | Checkout form state machine |
| `storefront/components/Providers.tsx` | SessionProvider + AuthSyncProvider wrapper |
| `docs/MEILISEARCH.md` | Search setup and indexing |

## Testing

**Backend integration tests** use `medusaIntegrationTestRunner` from `@medusajs/test-utils`:
```typescript
// backend/integration-tests/http/*.spec.ts
import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
medusaIntegrationTestRunner({
  inApp: true,
  testSuite: ({ api }) => {
    it("test endpoint", async () => {
      const response = await api.get('/store/endpoint');
      expect(response.status).toEqual(200);
    });
  },
});
```

## Performance

**DB Connection Warmup** - The `/store/warm` endpoint warms serverless DB connections. Called automatically during checkout initialization (`useCheckout.ts`). For new features with cold-start sensitivity, consider similar pre-warming.

**Redis (Optional)** - When `REDIS_URL` is set, enables event-bus-redis, cache-redis, and locking-redis modules. Without it, defaults to in-memory implementations.

## Admin UI

Custom admin routes in `backend/src/admin/routes/` (e.g., `banners/` for banner management). Uses Medusa Admin UI framework.

## Environment Variables

**Backend** (`.env`): `DATABASE_URL`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`, `MEILISEARCH_HOST`, `CLOUDINARY_*`, `REDIS_URL` (optional)

**Storefront** (`.env.local`): `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
