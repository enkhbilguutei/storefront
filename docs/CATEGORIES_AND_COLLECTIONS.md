# Category & Collection Seeding

This document explains the category hierarchy and collections that have been created for the Alimhan e-commerce store.

## What Was Created

### Categories (87 total)

A complete 3-level hierarchical category structure:

#### 1. **Apple** (Main Category)
- **iPhone**
  - iPhone 16 Series
  - iPhone 15 Series
  - Older iPhones
  - iPhone Accessories
- **iPad**
  - iPad Pro
  - iPad Air
  - iPad 11th Gen
  - iPad Mini
  - iPad Accessories
- **Mac**
  - MacBook Pro
  - MacBook Air
  - iMac
  - Mac mini
  - Mac Studio
  - Mac Accessories
- **Apple Watch**
  - Watch Series
  - Watch SE
  - Watch Bands
  - Watch Accessories
- **AirPods**
  - AirPods Pro
  - AirPods 3rd Gen
  - AirPods Max
  - AirPods Accessories
- **Apple Accessories**
  - MagSafe Chargers
  - Cables & Adapters
  - Power Banks

#### 2. **DJI** (Main Category)
- **Drones**
  - Mini Series
  - Air Series
  - Mavic Series
  - FPV / Avata
- **Gimbals**
  - Osmo Mobile
  - Osmo Pocket
  - Ronin Series
- **Action Cameras**
  - Osmo Action
- **DJI Accessories**
  - Batteries
  - Propellers
  - ND Filters
  - Chargers
  - Cases

#### 3. **Gaming** (Main Category)
- **PlayStation**
  - PS5 Console
  - PS5 Controllers
  - PS5 Games
  - PS5 Accessories
- **Nintendo**
  - Switch OLED
  - Switch Lite
  - Switch Games
  - Switch Accessories

#### 4. **Eyewear** (Main Category)
- **Ray-Ban Meta Glasses**
  - Wayfarer
  - Headliner
  - Glasses Accessories

#### 5. **Collectibles** (Main Category)
- **Pop Mart**
  - Blind Boxes
  - Limited Editions
  - Series Collections

### Collections (15 total)

Marketing and promotional collections:

1. **New Arrivals** - Latest products added to store
2. **Best Sellers** - Top-selling products
3. **Trending Now** - Currently popular items
4. **Back in Stock** - Recently restocked products
5. **Deals & Discounts** - Promotional items
6. **Apple Essentials** - Must-have Apple products
7. **Latest iPhone Releases** - Newest iPhone models
8. **Mac for Students** - Student-friendly Mac products
9. **Pro Creator Setup** - Professional content creation gear
10. **Beginner Drones** - Entry-level drones
11. **Pro Cinematic Gear** - Professional video equipment
12. **Top PS5 Games** - Best PlayStation 5 games
13. **Nintendo Starter Pack** - Nintendo Switch essentials
14. **Gifts Under 10000** - Affordable gift options (under 10,000₮)
15. **Holiday Specials** - Seasonal promotional items

## Scripts

### 1. `seed-category-hierarchy.ts`

Creates the complete 3-level category hierarchy with proper parent-child relationships.

**Usage:**
```bash
cd backend
pnpm medusa exec ./src/scripts/seed-category-hierarchy.ts
```

**Features:**
- Checks for existing categories to avoid duplicates
- Creates categories recursively with proper parent relationships
- Uses handle/slug for unique identification
- Skips already existing categories
- Provides detailed logging

### 2. `seed-collections.ts`

Creates marketing and promotional product collections.

**Usage:**
```bash
cd backend
pnpm medusa exec ./src/scripts/seed-collections.ts
```

**Features:**
- Checks for existing collections by handle
- Only creates missing collections
- Provides detailed logging

## Accessing in Medusa Admin

1. **Categories**: Navigate to **Products → Categories** in the Medusa Admin dashboard
   - You'll see the hierarchical tree structure
   - Click any category to expand and see subcategories
   - Assign products to categories when creating/editing products

2. **Collections**: Navigate to **Products → Collections** in the Medusa Admin dashboard
   - You'll see all 15 collections
   - Click to edit and add products to each collection
   - Use collections for homepage features, promotions, and marketing

## Using Categories in Storefront

Categories are automatically available via the Medusa API:

```typescript
// Get all categories with nested children
const categories = await sdk.store.category.list({
  fields: "+parent_category,+category_children",
});

// Get products in a specific category
const products = await sdk.store.product.list({
  category_id: ["category-id"],
});
```

## Using Collections in Storefront

Collections are available via the Medusa API:

```typescript
// Get all collections
const collections = await sdk.store.collection.list();

// Get products in a collection
const products = await sdk.store.product.list({
  collection_id: ["collection-id"],
});
```

## Next Steps

1. **Add Products**: Create products and assign them to appropriate categories
2. **Populate Collections**: Add products to collections for marketing purposes
3. **Update Storefront**: Update navigation menus to display categories
4. **Create Landing Pages**: Build collection landing pages for marketing campaigns

## Notes

- All categories use English names but can be localized later
- Categories use slug format for handles (e.g., `iphone-16-series`)
- Collections are marketing-focused and can contain products from any category
- Both scripts are idempotent - safe to run multiple times
- The hierarchy is designed to match common e-commerce patterns for tech products
