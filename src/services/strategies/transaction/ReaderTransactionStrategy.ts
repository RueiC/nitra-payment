// --- SERVICES ---
import type { TransactionStrategy } from '@/services/strategies/transaction/TransactionStrategy';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
import { httpService } from '@/infrastructures/api/index';

/**
 * ReaderTransactionStrategy
 *
 * Strategy implementation for transactions using a card reader (implements TransactionStrategy).
 *
 * This strategy sends the payload to the backend to create a transaction and re-throws exceptions
 * so callers can handle them.
 */
export class ReaderTransactionStrategy implements TransactionStrategy {
  /**
   * Execute reader transaction
   *
   * @param {TransactionPayload} payload - Transaction DTO (should include selectedReaderId, etc.)
   * @returns {Promise<void>} Resolves to void on success; throws on error
   *
   * @remarks
   * - Implementation calls httpService.postTransaction(payload) to send the transaction to the backend.
   * - Errors are logged here (console.error) and re-thrown for higher-level handling or display.
   */
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
