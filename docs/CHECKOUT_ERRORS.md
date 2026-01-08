# Checkout Error Quick Reference

## Common Checkout Errors

### Error: "Cart items require shipping profiles..."
**Quick Fix**:
```bash
cd backend && pnpm medusa exec ./src/scripts/fix-product-shipping-profiles.ts
```

**Prevention**: Automatic via `/backend/src/subscribers/ensure-shipping-profile.ts`

### Error: "Item ... is not stocked at location undefined"
**Quick Fix**:
```bash
cd backend && pnpm medusa exec ./src/scripts/fix-inventory-locations.ts
```

**Prevention**: Automatic via `/backend/src/subscribers/ensure-inventory-level.ts`

## For Developers

When creating products programmatically:

```typescript
// Always include shipping_profile_id
const products = [{
  title: "Product Name",
  // ... other fields
  shipping_profile_id: shippingProfile.id, // ← Required!
  // ...
}];

await createProductsWorkflow(container).run({
  input: { products },
});
```

When variants are created, inventory levels are now created automatically. If you need to manually create them:

```typescript
import { createInventoryLevelsWorkflow } from "@medusajs/core-flows";

await createInventoryLevelsWorkflow(container).run({
  input: {
    inventory_levels: [{
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    }],
  },
});
```

## More Details
See [CHECKOUT_FIXES.md](../CHECKOUT_FIXES.md) for complete documentation.
