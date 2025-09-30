// --- CONSTANTS ---
import {
  mockOrganization,
  mockLocations,
  mockLocationReaders,
} from '@/constant/index';
// --- INFRASTRUCTURE ---
import type {
  TransactionData,
  TransactionPayload,
} from '@/infrastructures/dto/Transaction';

/**
 * Delay helper that returns a Promise resolved after the given milliseconds.
 * Used to simulate network latency in the mock http service.
 *
 * @param {number} ms - Milliseconds to wait before resolving.
 * @returns {Promise<void>} Resolves after the specified delay.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  status: number;
  details?: any;
  /**
   * Error type used by the mock http service to surface status and details.
   *
   * @param {string} message - Human readable error message.
   * @param {number} [status=500] - HTTP-like status code representing the error.
   * @param {any} [details] - Optional additional error details (raw exception or payload).
   */
  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Mock HTTP service used by the application for local development and testing.
 * Methods simulate latency and return a shape similar to a real API response.
 */
export const httpService = {
  /**
   * Retrieve initial transaction data (organization, locations, readers).
   * Simulates a network request by awaiting `sleep` and returns a wrapped response.
   *
   * @returns {Promise<{status: number, message: string, data: TransactionData}>}
   */
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

  /**
   * Post a transaction payload. This mock implementation just logs the payload
   * and simulates a successful submission after a short delay.
   *
   * @param {TransactionPayload} payload - The transaction payload to post.
   * @returns {Promise<{status: number, message: string}>}
   */
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
