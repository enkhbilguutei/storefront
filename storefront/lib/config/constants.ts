/**
 * Centralized constants for the Alimhan storefront
 * Includes form placeholders, currency codes, and other reusable values
 */

// Currency configuration
export const DEFAULT_CURRENCY = "MNT";
export const CURRENCY_SYMBOL = "₮";

// Form placeholders (Mongolian)
export const PLACEHOLDERS = {
  phone: "99112233",
  email: "tanii@email.com",
  firstName: "Нэр",
  lastName: "Овог",
  address: "Хаяг",
  city: "Улаанбаатар",
  district: "Дүүрэг",
  khoroo: "Хороо",
  street: "Гудамж",
  building: "Байрны дугаар",
  apartment: "Тоот",
} as const;

// Phone validation regex
export const PHONE_REGEX = /^\d{8,9}$/;

// Popular search terms (can be moved to CMS/backend later)
export const POPULAR_SEARCHES = [
  "Galaxy S24",
  "Galaxy S24 Fe", 
  "Galaxy S24 Ultra",
  "Galaxy S25"
];

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5000,     // 5 seconds
  MEDIUM: 60000,   // 1 minute
  LONG: 300000,    // 5 minutes
} as const;
