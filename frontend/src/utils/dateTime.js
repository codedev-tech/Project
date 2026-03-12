/**
 * dateTime.js — Date / Time Utility Functions
 *
 * Shared helpers for formatting date and time values used across multiple
 * components. Centralising these here means you only need to update the
 * format logic in one place if the display requirement changes.
 */

/**
 * formatTime
 * Converts an ISO 8601 timestamp string to a locale-aware time string.
 *
 * Examples:
 *   formatTime('2026-03-13T08:42:00.000Z') // → '8:42:00 AM'
 *   formatTime(null)                         // → '-'
 *   formatTime(undefined)                    // → '-'
 *
 * @param {string|null|undefined} isoValue - ISO 8601 date-time string
 * @returns {string} Localised time string, or '-' if no value is provided
 */
export const formatTime = (isoValue) => {
  // Return a safe dash placeholder when the value is missing or empty
  if (!isoValue) {
    return '-'
  }

  // toLocaleTimeString() automatically uses the browser's locale
  return new Date(isoValue).toLocaleTimeString()
}
