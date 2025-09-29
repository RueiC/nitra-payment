// --- MODEL ---
import { TransactionMethod } from '@/models/enums/index';
// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';

export function validateTransactionPayload(
  method: TransactionMethod,
  payload: TransactionPayload,
): boolean {
  if (payload.amountInCents.lessThanOrEqualTo(0)) {
    throw new Error('Validation failed: Amount must be greater than 0.');
  }

  switch (method) {
    case TransactionMethod.Manually:
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
      if (!payload.selectedReaderId) {
        throw new Error(
          'Validation failed: A reader must be selected for reader transaction.',
        );
      }
      break;

    case TransactionMethod.Cash:
      break;

    default:
      console.warn(`Validation for method ${method} is not implemented.`);
      break;
  }

  // 所有檢查通過
  return true;
}
