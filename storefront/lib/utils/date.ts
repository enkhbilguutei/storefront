/**
 * Formats a date using standard Mongolian locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("mn-MN", options).format(dateObj);
}

/**
 * Formats a date with time
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date as relative (Today, Yesterday, or X days ago)
 * @param date - Date to format
 * @returns Relative date string in Mongolian
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diffTime = today.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Өнөөдөр";
  } else if (diffDays === 1) {
    return "Өчигдөр";
  } else if (diffDays < 7) {
    return `${diffDays} өдрийн өмнө`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} долоо хоногийн өмнө`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} сарын өмнө`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} жилийн өмнө`;
  }
}

/**
 * Formats a date in short format (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}
