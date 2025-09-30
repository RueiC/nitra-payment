// --- SERVICES ---
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
import { httpService } from '@/infrastructures/api/index';

/**
 * ManuallyTransactionStrategy
 *
 * Transaction handling strategy for manually entered card information (implements TransactionStrategy).
 *
 * This strategy sends the provided transaction payload to the backend API
 * (via httpService.postTransaction) and logs and re-throws errors on failure.
 */
export class ManuallyTransactionStrategy implements TransactionStrategy {
  /**
   * Execute manual transaction (user-entered card info)
   *
   * @param {TransactionPayload} payload - Transaction DTO, expected to include credit card fields
   * @returns {Promise<void>} Resolves to void on success; throws on failure
   *
   * @remarks
   * - This method calls the backend API to create a transaction record.
   * - On exception, it logs the error (console.error) and re-throws so the UI/Controller can handle or display it.
   */
  public async execute(payload: TransactionPayload): Promise<void> {
    try {
      // Simulate manual payment processing flow
      console.log('Simulating manual payment processing...');
      await httpService.postTransaction(payload);
      console.log('Manual transaction processed successfully.');
    } catch (error) {
      // Log the error and re-throw so higher levels can handle or notify the user
      console.error('Error processing manual transaction:', error);
      throw error;
    }
  }
}
