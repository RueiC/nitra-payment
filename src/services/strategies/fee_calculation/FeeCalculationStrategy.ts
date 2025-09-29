import Decimal from 'decimal.js';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';

export interface FeeCalculationStrategy {
  calculate(
    transaction: TransactionPayload,
    percentage: Decimal,
    fixed: Decimal,
  ): Decimal;
}
