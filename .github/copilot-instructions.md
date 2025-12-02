# Alimhan E-commerce Project Instructions

## ⚠️ Important Rules for Copilot

- **NEVER restart or interrupt the dev server** - The user manages their own dev servers manually, and **always watch errors through terminal output**
- Do not run `npm run dev` or similar commands that would restart running services

## Architecture Overview

This is a **Mongolian e-commerce platform** with a monorepo structure:
- `backend/` - Medusa v2 headless commerce backend (port 9000)
- `storefront/` - Next.js 16 frontend with App Router (port 3000)

**Data Flow**: Storefront → Medusa JS SDK (`lib/medusa.ts`) → Backend API → PostgreSQL

## Development Commands

```bash
# Run both services (from root)
npm run dev

# Backend only
cd backend && npm run dev

# Storefront only  
cd storefront && npm run dev

# Seed demo data (Mongolian products, MNT currency)
cd backend && npm run seed

# Create admin user (admin@alimhan.mn / applebyalimhan)
cd backend && medusa exec ./src/scripts/create-admin.ts

# Run backend tests
cd backend && npm run test:integration:http
```

## Key Patterns

### Backend (Medusa v2)

**API Routes**: Use `MedusaRequest`/`MedusaResponse` types:
```typescript
// backend/src/api/store/custom/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
export async function GET(req: MedusaRequest, res: MedusaResponse) { }
```

**Scripts**: Export default async function with `ExecArgs`:
```typescript
// backend/src/scripts/*.ts
import { ExecArgs } from "@medusajs/framework/types";
export default async function myScript({ container }: ExecArgs) { }
```

**Workflows**: Use Medusa core-flows for commerce operations (see `seed.ts` for examples).

### Storefront (Next.js)

**State Management**: Zustand stores in `lib/store.ts`:
- `useCartStore` - Cart state with persistence
- `useUserStore` - User auth state with persistence  
- `useUIStore` - UI state (mobile menu, search)

**Medusa Client**: Initialize via `lib/medusa.ts`, requires `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

**Validation**: Use Zod schemas from `lib/validations.ts` for forms.

**Images**: Use `CloudinaryImage` component for product images (handles both Cloudinary and regular URLs).

**Auth**: NextAuth with Medusa backend authentication at `/api/auth/[...nextauth]/route.ts`.

## Localization

- **Language**: Mongolian (mn) - UI text in Cyrillic
- **Currency**: MNT (Mongolian Tugrik)
- **Country Code**: MN

When adding user-facing text, use Mongolian. Price formatting: `Intl.NumberFormat("mn-MN", { style: "currency", currency: "mnt" })`.

## Environment Variables

### Backend (.env)
```
DATABASE_URL, STORE_CORS, ADMIN_CORS, AUTH_CORS, JWT_SECRET, COOKIE_SECRET
```

### Storefront (.env.local)
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<from seed output>
NEXTAUTH_SECRET, NEXTAUTH_URL
```

## File Conventions

| Path | Purpose |
|------|---------|
| `backend/src/api/store/*` | Public storefront API endpoints |
| `backend/src/api/admin/*` | Admin-only API endpoints |
| `backend/src/workflows/*` | Custom business logic workflows |
| `backend/src/modules/*` | Custom Medusa modules |
| `storefront/app/*` | Next.js App Router pages |
| `storefront/components/*` | Reusable React components |
| `storefront/lib/*` | Utilities, clients, stores |
