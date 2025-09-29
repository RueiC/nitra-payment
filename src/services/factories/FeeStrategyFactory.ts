import { PaymentMethod } from '@/models/enums/index';
import { CardFeeStrategy } from '@/services/strategies/fee_calculation/CardFeeStrategy';
import { CashFeeStrategy } from '@/services/strategies/fee_calculation/CashFeeStrategy';
import type { FeeCalculationStrategy } from '@/services/strategies/fee_calculation/FeeCalculationStrategy';

export class FeeStrategyFactory {
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
