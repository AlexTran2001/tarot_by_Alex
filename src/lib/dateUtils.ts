/**
 * Get today's date in YYYY-MM-DD format using a specific timezone
 * Defaults to Asia/Ho_Chi_Minh (UTC+7) for Vietnam
 * Works on both client and server side
 */
export function getTodayDate(timezone: string = "Asia/Ho_Chi_Minh"): string {
  try {
    const now = new Date();
    
    // Use Intl.DateTimeFormat to get the date in the specified timezone
    // en-CA locale returns YYYY-MM-DD format
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    
    return formatter.format(now);
  } catch (error) {
    // Fallback to local date if timezone is not supported
    console.warn(`Timezone ${timezone} not supported, using local date:`, error);
    return getTodayDateLocal();
  }
}

/**
 * Get today's date in YYYY-MM-DD format using local server timezone
 * Falls back to UTC if timezone is not available
 */
export function getTodayDateLocal(): string {
  const now = new Date();
  
  // Get local date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string to YYYY-MM-DD format
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

