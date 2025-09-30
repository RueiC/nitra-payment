// --- MODELS ---
import { TransactionMethod } from '@/models/enums/index';
// --- SERVICES ---
import { CashTransactionStrategy } from '@/services/strategies/transaction/CashTransactionStrategy';
import { ManuallyTransactionStrategy } from '@/services/strategies/transaction/ManuallyTransactionStrategy';
import { ReaderTransactionStrategy } from '@/services/strategies/transaction/ReaderTransactionStrategy';
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';

/**
 * TransactionStrategyFactory
 *
 * Transaction strategy factory: returns a corresponding TransactionStrategy instance
 * based on the provided TransactionMethod.
 *
 * Usage: when performing a transaction (for example manual input, card reader, or cash),
 * use this factory to obtain the appropriate strategy to handle the transaction flow.
 */
export class TransactionStrategyFactory {
  /**
   * Create the corresponding transaction strategy
   *
   * @param {TransactionMethod} method - Transaction method (Manually | Reader | Cash)
   * @returns {TransactionStrategy} The matching strategy instance
   * @throws {Error} Throws when an unsupported transaction method is provided
   *
   * @example
   * const strategy = TransactionStrategyFactory.create(TransactionMethod.Reader);
   */
  public static create(method: TransactionMethod): TransactionStrategy {
    switch (method) {
      case TransactionMethod.Manually:
        return new ManuallyTransactionStrategy();
      case TransactionMethod.Reader:
        return new ReaderTransactionStrategy();
      case TransactionMethod.Cash:
        return new CashTransactionStrategy();
      default:
        throw new Error(`Unsupported transaction method: ${method}`);
    }
  }
}
