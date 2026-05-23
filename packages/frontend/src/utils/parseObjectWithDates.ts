/**
 * Recursively walks through an object or array and converts
 * ISO date string values into `Date` objects.
 *
 * A value is considered a date string if:
 * - it is a string
 * - `new Date(value)` results in a valid Date
 *
 * This function should be used at API boundaries
 * to normalize backend JSON responses before they are used in the frontend.
 *
 * @template T
 * @param input - Any value (object, array, primitive)
 * @returns The same structure with date strings converted to `Date`
 */
export function parseObjectWithDates<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  // Convert valid date strings
  if (typeof input === "string") {
    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed as T;
    }
    return input;
  }

  // Recursively handle arrays
  if (Array.isArray(input)) {
    return input.map(parseObjectWithDates) as T;
  }

  // Recursively handle plain objects
  if (typeof input === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      result[key] = parseObjectWithDates(value);
    }

    return result as T;
  }

  return input;
}
