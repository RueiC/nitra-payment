// --- SERVICES ---
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
import { httpService } from '@/infrastructures/api/index';

export class ManuallyTransactionStrategy implements TransactionStrategy {
  public async execute(payload: TransactionPayload): Promise<void> {
    try {
      console.log('Simulating manual payment processing...');
      await httpService.postTransaction(payload);
      console.log('Manual transaction processed successfully.');
    } catch (error) {
      console.error('Error processing manual transaction:', error);
      throw error;
    }
  }
}
