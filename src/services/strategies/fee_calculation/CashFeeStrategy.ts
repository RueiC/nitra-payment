import Decimal from 'decimal.js';
// --- SERVICES ---
import type { FeeCalculationStrategy } from '@/services/strategies/fee_calculation/FeeCalculationStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';

import { FALLBACK_ZERO_STRING } from '@/constant/index';

export class CashFeeStrategy implements FeeCalculationStrategy {
  calculate(
    _transaction: TransactionPayload,
    _percentage: Decimal,
    _fixed: Decimal,
  ): Decimal {
    // 當前設計為現金不收手續費，直接回傳 0
    return new Decimal(FALLBACK_ZERO_STRING);
  }
}
