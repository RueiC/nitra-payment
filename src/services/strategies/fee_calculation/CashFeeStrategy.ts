import Decimal from 'decimal.js';
// --- SERVICES ---
import type { FeeCalculationStrategy } from '@/services/strategies/fee_calculation/FeeCalculationStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
// --- CONSTANTS ---
import { FALLBACK_ZERO_STRING } from '@/constant/index';

/**
 * CashFeeStrategy
 *
 * Implementation of the fee strategy for cash transactions (implements FeeCalculationStrategy).
 *
 * The current system design does not charge fees for cash transactions, so this strategy
 * returns 0 (as a Decimal).
 */
export class CashFeeStrategy implements FeeCalculationStrategy {
  /**
   * Calculate cash transaction fee
   *
   * @param {TransactionPayload} _transaction - Transaction DTO (unused, kept to satisfy the interface)
   * @param {Decimal} _percentage - Percentage parameter (unused)
   * @param {Decimal} _fixed - Fixed fee parameter (unused)
   * @returns {Decimal} Returns Decimal zero (constructed from FALLBACK_ZERO_STRING)
   *
   * @example
   * const fee = strategy.calculate(transaction, new Decimal(2.9), new Decimal(30));
   * // fee will be new Decimal(FALLBACK_ZERO_STRING)
   *
   * @remarks
   * - This method intentionally ignores the parameters and returns zero. If cash
   *   transactions should be charged in the future, implement the calculation here.
   */
  calculate(
    _transaction: TransactionPayload,
    _percentage: Decimal,
    _fixed: Decimal,
  ): Decimal {
  // Current design: cash transactions incur no fee, so return 0 directly
    return new Decimal(FALLBACK_ZERO_STRING);
  }
}
