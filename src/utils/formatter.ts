import Decimal from 'decimal.js';
// --- CONSTANTS ---
import { DEFAULT_DECIMAL_PLACES } from '@/constant';

/**
 * Convert an integer amount in cents into a formatted currency string (USD).
 *
 * - Input is in cents (for example 12345 represents $123.45).
 * - Uses decimal.js internally to avoid floating point precision issues and
 *   rounds down according to DEFAULT_DECIMAL_PLACES.
 * - Final formatting is handled by Intl.NumberFormat with `en-US` and `USD`.
 *
 * Note: the function accepts a number for cents; non-numeric or NaN values are treated as 0.
 *
 * @param {number} cents - Integer amount in cents, e.g. 100 => $1.00
 * @returns {string} Localized currency string formatted as en-US USD, e.g. "$1.00"
 *
 * @example
 * // returns "$123.45"
 * formatCurrency(12345);
 *
 * @example
 * // non-numeric or undefined is treated as 0, returns "$0.00"
 * formatCurrency(Number(undefined));
 *
 * @remarks
 * - Currently forces two decimal places (fractionDigits = 2). If you want to hide decimals
 *   for whole dollars, change the fractionDigits logic to depend on whether cents is a multiple of 100.
 */
export function formatCurrency(cents: number): string {
  // Convert input to number then wrap with Decimal; fall back to 0 if not numeric
  const numericCents = new Decimal(Number(cents) || 0);

  // There was previously commented logic to check for whole dollars (multiple of 100).
  // If you want to hide decimals automatically, you can enable it:
  // const isWholeNumber = numericCents.mod(100).abs().equals(0);

  // Currently forces two decimal places; to vary based on whole dollars use the isWholeNumber logic above
  const fractionDigits = 2;

  // Convert cents to dollars (divide by 100), round down to DEFAULT_DECIMAL_PLACES, then to string
  const amountInDollarsStr = numericCents
    .dividedBy(100)
    .toDecimalPlaces(DEFAULT_DECIMAL_PLACES, Decimal.ROUND_DOWN)
    .toString();

  // Use Intl.NumberFormat for localization and currency formatting (en-US, USD)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(parseFloat(amountInDollarsStr));
}
