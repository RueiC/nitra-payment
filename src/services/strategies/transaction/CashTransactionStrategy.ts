// --- SERVICES ---
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
import { httpService } from '@/infrastructures/api/index';

export class CashTransactionStrategy implements TransactionStrategy {
  public async execute(payload: TransactionPayload): Promise<void> {
    try {
      console.log('Simulating cash payment processing...');
      await httpService.postTransaction(payload);
      console.log('Cash transaction processed successfully.');
    } catch (error) {
      console.error('Error processing cash transaction:', error);
      throw error;
    }
  }
}
