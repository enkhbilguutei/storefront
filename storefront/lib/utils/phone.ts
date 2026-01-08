/**
 * Sanitizes phone number input by removing non-digits and limiting to 8 digits
 * @param value - Raw phone number input
 * @returns Sanitized phone number (max 8 digits)
 */
export function sanitizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

/**
 * Formats a phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (phone.length === 8) {
    return `${phone.slice(0, 4)} ${phone.slice(4)}`;
  }
  return phone;
}
