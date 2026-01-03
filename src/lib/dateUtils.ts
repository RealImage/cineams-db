import { format, parseISO, isValid } from "date-fns";

/**
 * Formats a date to "dd MMM yyyy" format (e.g., "03 Jan 2025")
 */
export const formatDate = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      // Try parsing common date formats
      const parsedDate = new Date(dateString);
      if (!isValid(parsedDate)) return String(dateString);
      return format(parsedDate, "dd MMM yyyy");
    }
    return format(date, "dd MMM yyyy");
  } catch {
    return String(dateString);
  }
};

/**
 * Formats a date with time to "dd MMM yyyy hh:mm a" format (e.g., "03 Jan 2025 02:30 pm")
 */
export const formatDateTime = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      const parsedDate = new Date(dateString);
      if (!isValid(parsedDate)) return String(dateString);
      return format(parsedDate, "dd MMM yyyy hh:mm a");
    }
    return format(date, "dd MMM yyyy hh:mm a");
  } catch {
    return String(dateString);
  }
};

/**
 * Formats time only to "hh:mm a" format (e.g., "02:30 pm")
 */
export const formatTime = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (!isValid(date)) {
      const parsedDate = new Date(dateString);
      if (!isValid(parsedDate)) return String(dateString);
      return format(parsedDate, "hh:mm a");
    }
    return format(date, "hh:mm a");
  } catch {
    return String(dateString);
  }
};
