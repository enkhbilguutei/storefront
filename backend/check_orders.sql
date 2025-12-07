SELECT 
  id,
  display_id,
  total,
  subtotal,
  tax_total,
  shipping_total,
  created_at,
  metadata
FROM "order"
ORDER BY created_at DESC
LIMIT 5;
