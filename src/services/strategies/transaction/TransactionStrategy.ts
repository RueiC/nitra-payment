// --- INFRASTRUCTURE ---
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';

export interface TransactionStrategy {
  execute(payload: TransactionPayload): Promise<void>;
}
