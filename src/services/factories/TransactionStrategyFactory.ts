import { TransactionMethod } from '@/models/enums/index';
import { CashTransactionStrategy } from '@/services/strategies/transaction/CashTransactionStrategy';
import { ManuallyTransactionStrategy } from '@/services/strategies/transaction/ManuallyTransactionStrategy';
import { ReaderTransactionStrategy } from '@/services/strategies/transaction/ReaderTransactionStrategy';
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';

export class TransactionStrategyFactory {
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
