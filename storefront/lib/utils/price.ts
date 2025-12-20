/**
 * Format price consistently to avoid hydration mismatches
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const symbol = currencyCode.toUpperCase() === "MNT" ? "₮" : currencyCode;
  return `${symbol}${formatted}`;
}
