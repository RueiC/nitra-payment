// --- SERVICES ---
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
import { httpService } from '@/infrastructures/api/index';

/**
 * CashTransactionStrategy
 *
 * Handling strategy for cash transactions (implements TransactionStrategy).
 *
 * This strategy demonstrates sending the transaction payload to a backend API
 * (via httpService.postTransaction) and re-throwing errors so the caller can
 * display or handle them.
 */
export class CashTransactionStrategy implements TransactionStrategy {
  /**
   * Execute cash transaction
   *
   * @param {TransactionPayload} payload - Transaction DTO
   * @returns {Promise<void>} Resolves to void on success; throws on failure
   *
   * @remarks
   * - This implementation calls httpService.postTransaction(payload) to send the transaction to the backend.
   * - If an exception occurs, it is logged here (console.error) and re-thrown for higher-level handling (UI/Controller).
   */
  public async execute(payload: TransactionPayload): Promise<void> {
    try {
      // Simulate cash payment processing flow
      console.log('Simulating cash payment processing...');
      await httpService.postTransaction(payload);
      console.log('Cash transaction processed successfully.');
    } catch (error) {
      // Log the error and re-throw so the caller can display the error or retry
      console.error('Error processing cash transaction:', error);
      throw error;
    }
  }
}
