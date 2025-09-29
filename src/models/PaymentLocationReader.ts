import { ReaderStatus } from '@/models/enums/index';

export interface PaymentLocationReader {
  id: number;

  label: string;

  readerId: string;

  status: ReaderStatus;

  locationId: number;

  createdAt: string;

  updatedAt: string;

  deletedAt: string | null;
}
