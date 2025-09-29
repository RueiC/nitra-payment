import {
  mockOrganization,
  mockLocations,
  mockLocationReaders,
} from '@/constant/index';
import type {
  TransactionData,
  TransactionPayload,
} from '@/infrastructures/dto/Transaction';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const httpService = {
  async getTransactionData(): Promise<any> {
    try {
      await sleep(1500);

      const data: TransactionData = {
        mockOrganization,
        mockLocations,
        mockLocationReaders,
      };

      return {
        status: 200,
        message: 'Success',
        data,
      };
    } catch (error) {
      console.error('httpService.getTransactionData error:', error);
      throw new ApiError('Error fetching transaction data', 500, error);
    }
  },

  async postTransaction(payload: TransactionPayload): Promise<any> {
    try {
      await sleep(1000);

      console.log('Transaction posted:', payload);

      return {
        status: 200,
        message: 'Transaction posted successfully',
      };
    } catch (error) {
      console.error('httpService.getTransactionData error:', error);
      throw new ApiError('Error fetching transaction data', 500, error);
    }
  },
};

export default httpService;
