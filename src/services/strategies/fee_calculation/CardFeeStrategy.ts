import Decimal from 'decimal.js';
// --- SERVICES ---
import type { FeeCalculationStrategy } from '@/services/strategies/fee_calculation/FeeCalculationStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';

import { FALLBACK_ZERO_STRING, PERCENTAGE_DIVISOR } from '@/constant/index';

export class CardFeeStrategy implements FeeCalculationStrategy {
  calculate(
    transaction: TransactionPayload,
    percentage: Decimal,
    fixed: Decimal,
  ): Decimal {
    try {
      const subtotal = transaction.amountInCents.plus(
        transaction.calculatedTaxInCents,
      );
      const result = subtotal
        .times(percentage.div(PERCENTAGE_DIVISOR))
        .plus(fixed);
      return result;
    } catch (error) {
      console.error('Error calculating card fee:', error);
      return new Decimal(FALLBACK_ZERO_STRING);
    }
  }
}
