export interface Organization {
  id: number;

  name: string;

  totalProcessingFeeFixed: number;

  totalProcessingFeePercentage: string;

  createdAt: string;

  updatedAt: string;

  deletedAt: string | null;
}
