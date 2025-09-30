// --- MODEL ---
import { TransactionMethod } from '@/models/enums/index';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';

/**
 * Validate that the transaction payload meets the requirements for the specified transaction method
 *
 * - Performs additional field checks based on the TransactionMethod (Manually / Reader / Cash).
 * - If validation fails, an Error is thrown and the caller should catch and display an appropriate message.
 *
 * @param {TransactionMethod} method - Transaction method (manual, reader, cash, etc.)
 * @param {TransactionPayload} payload - Transaction DTO from infrastructures
 * @returns {boolean} Returns true if all validations pass
 * @throws {Error} Throws in the following cases:
 *  - amountInCents <= 0 -> 'Validation failed: Amount must be greater than 0.'
 *  - Missing any credit card fields for Manually -> 'Validation failed: Complete credit card details are required for manual transaction.'
 *  - No reader selected for Reader -> 'Validation failed: A reader must be selected for reader transaction.'
 *
 * @example
 * // Example: manual transaction with all fields present
 * validateTransactionPayload(TransactionMethod.Manually, payload);
 */
export function validateTransactionPayload(
  method: TransactionMethod,
  payload: TransactionPayload,
): boolean {
  // Basic amount check: must be greater than 0 (amountInCents is a Decimal)
  if (payload.amountInCents.lessThanOrEqualTo(0)) {
    throw new Error('Validation failed: Amount must be greater than 0.');
  }

  // 根據不同交易方式做額外驗證
  switch (method) {
    case TransactionMethod.Manually:
      // Manual entry (card) requires complete credit card details
      if (
        !payload.creditCardDetails ||
        !payload.creditCardDetails.name ||
        !payload.creditCardDetails.cardNumber ||
        !payload.creditCardDetails.expirationDate ||
        !payload.creditCardDetails.cvc ||
        !payload.creditCardDetails.country ||
        !payload.creditCardDetails.zip
      ) {
        throw new Error(
          'Validation failed: Complete credit card details are required for manual transaction.',
        );
      }
      break;

    case TransactionMethod.Reader:
      // When using a reader, a reader ID must be selected
      if (!payload.selectedReaderId) {
        throw new Error(
          'Validation failed: A reader must be selected for reader transaction.',
        );
      }
      break;

    case TransactionMethod.Cash:
      // Cash transactions have no additional field requirements
      break;

    default:
      // If other methods are not implemented, warn but do not block the flow
      // (optionally could throw instead based on requirements)
      console.warn(`Validation for method ${method} is not implemented.`);
      break;
  }

  // 所有檢查通過
  return true;
}
