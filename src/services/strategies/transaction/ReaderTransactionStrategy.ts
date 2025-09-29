// --- SERVICES ---
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
import { httpService } from '@/infrastructures/api/index';

export class ReaderTransactionStrategy implements TransactionStrategy {
  public async execute(payload: TransactionPayload): Promise<void> {
    try {
      console.log('Simulating reader payment processing...');
      await httpService.postTransaction(payload);
      console.log('Reader transaction processed successfully.');
    } catch (error) {
      console.error('Error processing reader transaction:', error);
      throw error;
    }
  }
}
