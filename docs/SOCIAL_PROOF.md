# Social Proof & Trust Signals

This document describes the social proof and trust badge features implemented in the Alimhan e-commerce platform.

## Features

### 1. **Trust Badges**
Displays trust signals like warranty, authenticity, free shipping, and return policy.

**Component:** `TrustBadges`
- **Variants:**
  - `compact`: Small badges with icons and text
  - `detailed`: Full cards with descriptions

**Usage:**
```tsx
import { TrustBadges } from "@/components/products/TrustBadges"

// Compact version
<TrustBadges variant="compact" />

// Detailed version (default)
<TrustBadges variant="detailed" />
```

**Locations:**
- Product detail page (compact variant)
- Homepage (detailed variant)

### 2. **Viewing Counter**
Shows real-time count of users currently viewing a product.

**Component:** `ViewingCounter`
- Tracks unique viewers in the last 5 minutes
- Auto-refreshes every 30 seconds
- Only shows when 2+ viewers
- Mongolian text: "X хүн энэ бүтээгдэхүүнийг харж байна"

**Usage:**
```tsx
import { ViewingCounter } from "@/components/products/ViewingCounter"

<ViewingCounter productId={product.id} />
```

**Backend:**
- Endpoint: `POST /store/product-analytics/view`
- Tracks by `customer_id`, `session_id`, or `ip_address`

### 3. **Recent Sales Counter**
Displays number of items sold in the last 24 hours.

**Component:** `RecentSales`
- Fetches from backend on mount
- Only shows when sales > 0
- Mongolian text: "Сүүлийн 24 цагт X ширхэг зарагдсан"

**Usage:**
```tsx
import { RecentSales } from "@/components/products/RecentSales"

<RecentSales productId={product.id} />
```

**Backend:**
- Endpoint: `GET /store/product-analytics/stats/:productId`
- Auto-tracked via `order.placed` event subscriber

### 4. **Customer Reviews with Photos**
Full-featured review system with photo uploads, ratings, and verification badges.

**Component:** `CustomerReviews`
- 5-star rating system
- Photo gallery support (Cloudinary)
- Verified purchase badge
- "Helpful" voting
- Admin moderation required

**Usage:**
```tsx
import { CustomerReviews } from "@/components/products/CustomerReviews"

<CustomerReviews productId={product.id} />
```

**Features:**
- Average rating display
- Review count
- Customer names
- Date posted
- Review photos (if uploaded)
- Verified purchase indicator
- Helpful button with count

## Backend Module: `product-analytics`

### Models

**ProductView**
- `product_id`: Product being viewed
- `customer_id`: Logged-in customer (optional)
- `session_id`: Anonymous session (optional)
- `ip_address`: Visitor IP (optional)
- `viewed_at`: Timestamp

**ProductSale**
- `product_id`: Product sold
- `order_id`: Order reference
- `quantity`: Items sold
- `sold_at`: Timestamp

**ProductReview**
- `product_id`: Product reviewed
- `customer_id`: Reviewer
- `customer_name`: Display name
- `rating`: 1-5 stars
- `title`: Review title (optional)
- `comment`: Review text
- `photos`: Array of Cloudinary URLs (optional)
- `verified_purchase`: Boolean
- `is_approved`: Requires admin approval
- `helpful_count`: Upvote count
- `created_at`, `updated_at`

### API Endpoints

**Track View**
```
POST /store/product-analytics/view
Body: { product_id: string }
Response: { success: boolean, current_viewers: number }
```

**Get Product Stats**
```
GET /store/product-analytics/stats/:productId
Response: {
  product_id: string
  current_viewers: number
  recent_sales_24h: number
  rating: { average: number, count: number }
}
```

**Get Reviews**
```
GET /store/product-analytics/reviews/:productId?limit=10&offset=0
Response: {
  reviews: Review[]
  rating: { average: number, count: number }
  limit: number
  offset: number
}
```

**Create Review**
```
POST /store/product-analytics/reviews/:productId
Body: {
  rating: number (1-5)
  title?: string
  comment: string
  photos?: string[]
}
Response: { review: Review, message: string }
```

**Mark Review Helpful**
```
POST /store/product-analytics/reviews/:reviewId/helpful
Response: { success: boolean }
```

### Subscribers

**product-sales-tracker**
- Listens to: `order.placed`
- Auto-tracks sales for recent sales counter

## Setup

### 1. Database Migration
The module is auto-registered in `medusa-config.ts`. Run migrations:

```bash
cd backend
pnpm build
medusa db:migrate
```

### 2. Seed Demo Data
Populate analytics with realistic demo data:

```bash
cd backend
medusa exec ./src/scripts/seed-analytics.ts
```

This creates:
- 5-25 views per product (last 24h)
- 1-5 sales per product (last 24h)
- 2-4 reviews for first 10 products (approved)

### 3. Environment Variables
No additional environment variables required. Uses existing Medusa backend URL:

```env
# storefront/.env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

## Integration

### Product Detail Page
All social proof components are integrated in `ProductDetails.tsx`:

```tsx
{/* Social Proof Indicators */}
<div className="space-y-3 mb-8">
  <ViewingCounter productId={product.id} />
  <RecentSales productId={product.id} />
</div>

{/* Trust Badges */}
<div className="mb-8">
  <TrustBadges variant="compact" />
</div>

{/* Customer Reviews */}
<div className="border-t border-gray-100 pt-8">
  <CustomerReviews productId={product.id} />
</div>
```

### Homepage
Trust badges featured prominently:

```tsx
<section className="container mx-auto px-4 py-12 md:py-16">
  <div className="text-center mb-8">
    <h2>Яагаад биднээс худалдан авах хэрэгтэй вэ?</h2>
    <p>100% жинхэнэ бүтээгдэхүүн, найдвартай үйлчилгээ, хурдан хүргэлт</p>
  </div>
  <TrustBadges variant="detailed" />
</section>
```

## Admin Management

### Approve Reviews
Reviews require admin approval before display. Use the `approve-review` script:

```bash
cd backend
medusa exec ./src/scripts/approve-review.ts <reviewId>
```

Or approve via service:

```typescript
const analyticsService = container.resolve("product-analytics")
await analyticsService.approveReview(reviewId)
```

### View Pending Reviews
Query unapproved reviews:

```typescript
const reviews = await analyticsService.listProductReviews({
  filters: { is_approved: false }
})
```

## Future Enhancements

1. **Admin UI**: Review moderation panel in Medusa Admin
2. **Photo Upload**: Cloudinary upload widget for customer reviews
3. **Review Form**: Dedicated review submission form
4. **Email Notifications**: Alert admins when new reviews arrive
5. **Review Filtering**: Sort by rating, date, helpful count
6. **Response System**: Allow store to respond to reviews
7. **Abuse Reporting**: Flag inappropriate reviews
8. **Analytics Dashboard**: View trends, top products, sentiment analysis

## Notes

- All Mongolian text uses Cyrillic script
- Components are client-side for real-time updates
- View tracking respects user privacy (anonymous sessions)
- Reviews support HTML escaping for security
- Photo URLs use Cloudinary for optimization
