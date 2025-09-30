// --- MODELS ---
import { PaymentMethod } from '@/models/enums/index';
// --- SERVICES ---
import { CardFeeStrategy } from '@/services/strategies/fee_calculation/CardFeeStrategy';
import { CashFeeStrategy } from '@/services/strategies/fee_calculation/CashFeeStrategy';
import type { FeeCalculationStrategy } from '@/services/strategies/fee_calculation/FeeCalculationStrategy';

/**
 * FeeStrategyFactory
 *
 * Fee strategy factory: returns the corresponding FeeCalculationStrategy
 * instance based on the provided payment method (PaymentMethod).
 *
 * Usage: used when calculating fees to choose the credit card strategy
 * or cash strategy depending on the payment method.
 */
export class FeeStrategyFactory {
  /**
   * Create the appropriate fee strategy instance
   *
   * @param {PaymentMethod} method - Payment method (e.g. PaymentMethod.Card or PaymentMethod.Cash)
   * @returns {FeeCalculationStrategy} The corresponding strategy instance
   * @throws {Error} If an unsupported payment method is provided
   *
   * @example
   * const strategy = FeeStrategyFactory.create(PaymentMethod.Card);
   */
  public static create(method: PaymentMethod): FeeCalculationStrategy {
    switch (method) {
      case PaymentMethod.Card:
        return new CardFeeStrategy();
      case PaymentMethod.Cash:
        return new CashFeeStrategy();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}
