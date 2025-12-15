const TRADE_IN_APPLE_KEYWORDS = [
  "iphone",
  "ipad",
  "watch",
  "apple-watch",
  "mac",
  "macbook",
  "imac",
  "airpods",
  "airpod",
] as const;

function includesAnyKeyword(input: string) {
  const haystack = input.toLowerCase();
  return TRADE_IN_APPLE_KEYWORDS.some((kw) => haystack.includes(kw));
}

export function isTradeInEligibleAppleProductText(product: {
  handle?: string | null;
  title?: string | null;
}) {
  if (product.handle && includesAnyKeyword(product.handle)) return true;
  if (product.title && includesAnyKeyword(product.title)) return true;
  return false;
}

export const TRADE_IN_BADGE_TEXT = "Трейд-ин";
export const TRADE_IN_BADGE_TITLE = "Трейд-ин боломжтой";
