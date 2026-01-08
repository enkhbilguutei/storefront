# Checkout Error Fixes - Summary

## Problems Fixed

### 1. Shipping Profile Error
**Error**: "The cart items require shipping profiles that are not satisfied by the current shipping methods"

**Cause**: 23 products were created without `shipping_profile_id` associations, preventing Medusa from matching them with available shipping methods.

### 2. Inventory Location Error  
**Error**: "Item iitem_01KC757P04M7MKCEZ4KC8TSQ6F is not stocked at location undefined"

**Cause**: 88 inventory items were missing stock location associations, preventing checkout from validating inventory availability.

## Solutions Implemented

### Shipping Profile Fix

#### Fix Script (`fix-product-shipping-profiles.ts`)
- Scans all products for missing shipping profile associations
- Identifies the default shipping profile
- Creates proper links between products and the default shipping profile

**Location**: `/backend/src/scripts/fix-product-shipping-profiles.ts`

**Usage**:
```bash
cd backend && pnpm medusa exec ./src/scripts/fix-product-shipping-profiles.ts
```

**Result**: ✓ Successfully fixed all 23 products

#### Prevention Subscriber (`ensure-shipping-profile.ts`)
Automatically assigns the default shipping profile to newly created products that don't have one.

**Location**: `/backend/src/subscribers/ensure-shipping-profile.ts`

### Inventory Location Fix

#### Fix Script (`fix-inventory-locations.ts`)
- Scans all inventory items for missing stock location associations
- Identifies available stock locations
- Creates inventory levels at the primary stock location with default stock (1,000,000 units)

**Location**: `/backend/src/scripts/fix-inventory-locations.ts`

**Usage**:
```bash
cd backend && pnpm medusa exec ./src/scripts/fix-inventory-locations.ts
```

**Result**: ✓ Successfully created inventory levels for 88 items

#### Prevention Subscriber (`ensure-inventory-level.ts`)
Automatically creates inventory levels at the default stock location for newly created product variants.

**Location**: `/backend/src/subscribers/ensure-inventory-level.ts`


## Testing
1. Clear your cart (or refresh the page)
2. Add products to cart
3. Proceed to checkout
4. Both errors should no longer appear
5. Checkout should complete successfully

## Affected Items

### Products Without Shipping Profiles (Fixed)
23 products including:
- AirPods Pro 2, AirPods 4, AirPods 4 with ANC
- iPhone 17, iPhone 17 Pro, iPhone 17 Pro Max, iPhone Air
- iPad Air 11-inch, iPad mini, iPad Pro 13-inch
- MacBook Air M4 13-inch, MacBook Pro M4 14-inch, MacBook Pro M5 14-inch
- Apple Watch Series 11
- PlayStation 5 Slim

## Best Practices Going Forward

### For Product Creation
1. **Always specify `shipping_profile_id`** when creating products programmatically
2. The shipping profile subscriber will catch products created without profiles as a safety net

### For Inventory Management
1. **Inventory levels are auto-created** for new variants via the subscriber
2. Default stock is set to 1,000,000 units (adjust in subscriber if needed)
3. Uses the first available stock location (typically the main warehouse)

### Maintenance Scripts
Run these periodically if you suspect missing associations:

```bash
# Check and fix products without shipping profiles
cd backend && pnpm medusa exec ./src/scripts/fix-product-shipping-profiles.ts

# Check and fix inventory items without stock locations
cd backend && pnpm medusa exec ./src/scripts/fix-inventory-locations.ts

## Technical Details

### Shipping Profiles - Why Link Module?
In Medusa v2, relationships between modules are managed through the Link module (`ContainerRegistrationKeys.LINK`), not direct foreign keys. This allows for:
- Better decoupling between modules
- More flexible relationship management
- Proper module boundaries

**Correct API Usage for Shipping Profiles**:
```typescript
// ✗ Wrong (doesn't work in Medusa v2)
await productModuleService.updateProducts({
  id: productId,
  shipping_profile_id: profileId,
});

// ✓ Correct
await link.create({
  [Modules.PRODUCT]: {
    product_id: productId,
  },
  [Modules.FULFILLMENT]: {
    shipping_profile_id: profileId,
  },
});
```

## Related Files

### Scripts
- Shipping profile fix: `/backend/src/scripts/fix-product-shipping-profiles.ts`
- Inventory location fix: `/backend/src/scripts/fix-inventory-locations.ts`
- Seed script reference: `/backend/src/scripts/seed.ts` (shows correct usage)

### Subscribers
- Shipping profile prevention: `/backend/src/subscribers/ensure-shipping-profile.ts`
- Inventory level prevention: `/backend/src/subscribers/ensure-inventory-level.ts`

### Storefront
- Checkout flow: `/storefront/lib/checkout/actions.ts`
- Checkout hook: `/storefront/lib/checkout/useCheckoutlment
- Track inventory across multiple warehouses
- Prevent overselling

**Correct API Usage for Inventory Levels**:
```typescript
import { createInventoryLevelsWorkflow } from "@medusajs/core-flows";

await createInventoryLevelsWorkflow(container).run({
  input: {
    inventory_levels: [{
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItemId,
    }]
### Correct API Usage
```typescript
// ✗ Wrong (doesn't work in Medusa v2)
await productModuleService.updateProducts({
  id: productId,
  shipping_profile_id: profileId,
});

// ✓ Correct
await link.create({
  [Modules.PRODUCT]: {
    product_id: productId,
  },
  [Modules.FULFILLMENT]: {
    shipping_profile_id: profileId,
  },
});
```

## Related Files
- Fix script: `/backend/src/scripts/fix-product-shipping-profiles.ts`
- Prevention subscriber: `/backend/src/subscribers/ensure-shipping-profile.ts`
- Seed script reference: `/backend/src/scripts/seed.ts` (shows correct usage)
- Checkout flow: `/storefront/lib/checkout/actions.ts`
