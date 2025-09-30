import Decimal from 'decimal.js';
// --- SERVICES ---
import type { FeeCalculationStrategy } from '@/services/strategies/fee_calculation/FeeCalculationStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
// --- CONSTANTS ---
import { FALLBACK_ZERO_STRING, PERCENTAGE_DIVISOR } from '@/constant/index';

/**
 * CardFeeStrategy
 *
 * Implementation of the fee calculation strategy for card payments (implements FeeCalculationStrategy).
 *
 * Calculation steps:
 *  1. subtotal = transaction.amountInCents + transaction.calculatedTaxInCents
 *     (both represented as Decimals in cents or the same unit).
 *  2. Calculate percentage fee using percentage / PERCENTAGE_DIVISOR, then add the fixed fee.
 *
 * If an exception occurs during calculation (e.g. wrong input types), the error is logged in the
 * catch block and a fallback zero Decimal (FALLBACK_ZERO_STRING) is returned.
 */
export class CardFeeStrategy implements FeeCalculationStrategy {
  /**
   * Calculate card fee
   *
   * @param {TransactionPayload} transaction - Transaction DTO; should include amountInCents and calculatedTaxInCents as Decimals
   * @param {Decimal} percentage - Percentage (e.g. 2.9 for 2.9%); calculation divides this by PERCENTAGE_DIVISOR
   * @param {Decimal} fixed - Fixed fee (in the same money unit, e.g. cents as Decimal)
   * @returns {Decimal} The calculated fee as a Decimal
   *
   * @example
   * const fee = strategy.calculate(transaction, new Decimal(2.9), new Decimal(30));
   *
   * @remarks
   * - This method assumes the transaction amount fields are Decimal and safe to operate on.
   * - If the calculation fails, the error is logged and new Decimal(FALLBACK_ZERO_STRING) is returned as a fallback value.
   */
  calculate(
    transaction: TransactionPayload,
    percentage: Decimal,
    fixed: Decimal,
  ): Decimal {
    try {
      // subtotal = amountInCents + calculatedTaxInCents
      const subtotal = transaction.amountInCents.plus(
        transaction.calculatedTaxInCents,
      );

      // result = subtotal * (percentage / PERCENTAGE_DIVISOR) + fixed
      const result = subtotal
        .times(percentage.div(PERCENTAGE_DIVISOR))
        .plus(fixed);
      return result;
    } catch (error) {
      // If an error occurs during calculation, log it and return the fallback zero value
      // to avoid breaking the overall flow
      console.error('Error calculating card fee:', error);
      return new Decimal(FALLBACK_ZERO_STRING);
    }
  }
}
