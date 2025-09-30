import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import Decimal from 'decimal.js';
// --- MODEL ---
import { PaymentMethod, TransactionMethod } from '@/models/enums/index';
import type { Location } from '@/models/Location';
import type { PaymentLocationReader } from '@/models/PaymentLocationReader';
// --- SERVICES ---
import { validateTransactionPayload } from '@/services/validators/transactionValidator';
import { FeeStrategyFactory } from '@/services/factories/FeeStrategyFactory';
import { TransactionStrategyFactory } from '@/services/factories/TransactionStrategyFactory';
// --- INFRASTRUCTURE ---
import { httpService } from '@/infrastructures/api/index';
import type { TransactionPayload } from '@/infrastructures/dto/Transaction';
// --- CONSTANTS ---
import {
  FALLBACK_ZERO_STRING,
  PERCENTAGE_DIVISOR,
  FALLBACK_ZERO_PERCENTAGE_STRING,
} from '@/constant/index';

export const useTransactionStore = defineStore('transaction', () => {
  // --- STATES ---
  const isPaymentDataLoaded = ref(false);
  const transaction = ref<TransactionPayload>({
    amountInCents: new Decimal(FALLBACK_ZERO_STRING),
    calculatedTaxInCents: new Decimal(FALLBACK_ZERO_STRING), // calculated tax in cents
    patientFeeInCents: new Decimal(FALLBACK_ZERO_STRING), // patient's processing fee in cents
    totalAmountInCents: new Decimal(FALLBACK_ZERO_STRING), // total processing amount in cents

    description: '', // payment description

    paymentMethod: PaymentMethod.Cash, // payment method
    transactionMethod: TransactionMethod.Cash, // transaction method

    selectedLocationId: null, // selected location id
    selectedReaderId: null, // selected reader id

    creditCardDetails: {
      name: '',
      cardNumber: '',
      expirationDate: '',
      cvc: '',
      country: '',
      zip: '',
    },
  });
  const locations = ref<Location[]>([]);
  const paymentReaders = ref<PaymentLocationReader[]>([]);
  const totalProcessingFeePercentage = ref<Decimal>(
    new Decimal(FALLBACK_ZERO_STRING),
  );
  const totalProcessingFeeFixedInCents = ref<Decimal>(
    new Decimal(FALLBACK_ZERO_STRING),
  );
  const patientProcessingFeePercentage = ref<Decimal>(
    new Decimal(FALLBACK_ZERO_STRING),
  );
  const patientProcessingFeeFixedInCents = ref<Decimal>(
    new Decimal(FALLBACK_ZERO_STRING),
  );

  // --- GETTERS ---
  // Compute the subtotal for the current transaction.
  // This sums the payment amount (in cents) and the calculated tax (in cents)
  // and returns the result as a Decimal so downstream calculations remain precise.
  const subtotal = computed<Decimal>(() => {
    const amountInCents = new Decimal(transaction.value.amountInCents);
    const calculatedTaxInCents = new Decimal(
      transaction.value.calculatedTaxInCents,
    );
    return amountInCents.plus(calculatedTaxInCents);
  });

  // Return the currently selected Location object (or null).
  // Looks up the location list by matching `selectedLocationId` from the transaction.
  const selectedLocation = computed(() => {
    return (
      locations.value?.find(
        (loc: Location) => loc.id === transaction.value.selectedLocationId,
      ) ?? null
    );
  });

  // Return the currently selected PaymentLocationReader (or null).
  // Matches the `selectedReaderId` stored on the transaction against available readers.
  const selectedReader = computed(() => {
    return (
      paymentReaders.value?.find(
        (reader: PaymentLocationReader) =>
          reader.id === transaction.value.selectedReaderId,
      ) ?? null
    );
  });

  // Get the tax rate for the currently selected location as a Decimal.
  // If no location is selected or it lacks a taxRate, fall back to a zero percentage string.
  const currentTaxRate = computed<Decimal>(() => {
    return new Decimal(
      selectedLocation.value?.taxRate ?? FALLBACK_ZERO_PERCENTAGE_STRING,
    );
  });

  // --- SETTERS ---
  /**
   * Reset the transaction object to its default (empty) state.
   * This clears amounts, fees, descriptions, payment method, and selected IDs.
   * After reset, the store will attempt to select the first available location
   * (if any) so that downstream computed values and watchers have a default.
   *
   * @returns {void}
   */
  function resetTransaction(): void {
    transaction.value = {
      amountInCents: new Decimal(FALLBACK_ZERO_STRING),
      calculatedTaxInCents: new Decimal(FALLBACK_ZERO_STRING),
      patientFeeInCents: new Decimal(FALLBACK_ZERO_STRING),
      totalAmountInCents: new Decimal(FALLBACK_ZERO_STRING),

      description: '',

      paymentMethod: PaymentMethod.Cash,
      transactionMethod: TransactionMethod.Cash,

      selectedLocationId: null,
      selectedReaderId: null,

      creditCardDetails: {
        name: '',
        cardNumber: '',
        expirationDate: '',
        cvc: '',
        country: '',
        zip: '',
      },
    };

    selectLocation(locations.value[0]?.id ?? null);
  }

  /**
   * Select a location by id for the current transaction.
   * Selecting a new location will also clear any previously selected reader
   * because readers are tied to locations.
   *
   * @param {number | null} locationId - The id of the location to select, or null to clear.
   * @returns {void}
   */
  function selectLocation(locationId: number | null): void {
    // clear reader selection when changing location
    transaction.value.selectedReaderId = null;
    transaction.value.selectedLocationId = locationId;
  }

  /**
   * Select a payment reader for the current transaction.
   *
   * @param {number | null} selectedReaderId - The reader id to select, or null to clear.
   * @returns {void}
   */
  function selectPaymentReader(selectedReaderId: number | null): void {
    transaction.value.selectedReaderId = selectedReaderId;
  }

  /**
   * Update the payment amount for the current transaction.
   * The amount is stored in cents as a Decimal to preserve precision.
   * Note: watchers will recalculate tax/fees/total when this value changes.
   *
   * @param {Decimal} newAmountInCents - New payment amount in cents.
   * @returns {void}
   */
  function updatePaymentAmount(newAmountInCents: Decimal): void {
    transaction.value.amountInCents = newAmountInCents;
  }

  /**
   * Update the patient's processing fee (in cents) for the current transaction.
   * Stored as Decimal for precision; changing this will trigger totals recalculation.
   *
   * @param {Decimal} newFeeInCents - New patient fee in cents.
   * @returns {void}
   */
  function updatePatientFee(newFeeInCents: Decimal): void {
    transaction.value.patientFeeInCents = newFeeInCents;
  }

  /**
   * Update the description for the current transaction.
   *
   * @param {string} newDescription - New payment description text.
   * @returns {void}
   */
  function updatePaymentDescription(newDescription: string): void {
    transaction.value.description = newDescription;
  }

  /**
   * Select the payment method (e.g., Cash, Card) for the transaction.
   * Changing the payment method may affect fee calculation strategies.
   *
   * @param {PaymentMethod} method - The payment method to use for this transaction.
   * @returns {void}
   */
  function selectPaymentMethod(method: PaymentMethod): void {
    transaction.value.paymentMethod = method;
  }

  // --- ACTIONS ---
  /**
   * Validate and submit the transaction using the appropriate strategy.
   * This function runs synchronous validation first, then delegates the
   * actual submission to a TransactionStrategy created by the factory.
   * On success it resets the local transaction state.
   *
   * @param {TransactionMethod} method - The transaction method to use (e.g. Reader, Manual).
   * @param {TransactionPayload} payload - The prepared transaction payload to submit.
   * @throws Will re-throw any error produced by validation or strategy execution.
   * @returns {Promise<void>} Resolves when submission completes.
   */
  async function submitTransaction(
    method: TransactionMethod,
    payload: TransactionPayload,
  ): Promise<void> {
    try {
      // --- VALIDATION ---
      validateTransactionPayload(method, payload);

      // --- TRANSACTION ---
      const strategy = TransactionStrategyFactory.create(method);
      await strategy.execute(payload);

      // reset local state after successful submission
      resetTransaction();
    } catch (error) {
      console.error(
        `Error submitting transaction with method ${method}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Fetch initial data required for payment creation.
   * This populates processing fee settings, available locations and readers,
   * and selects the first location by default. The function is idempotent and
   * will not refetch if data is already loaded (guarded by isPaymentDataLoaded).
   *
   * Side effects:
   * - sets `totalProcessingFeePercentage` and `totalProcessingFeeFixedInCents`
   * - fills `locations` and `paymentReaders`
   * - selects the first location if available
   * - marks `isPaymentDataLoaded` true when finished
   *
   * @throws Re-throws any network or parsing error from httpService.
   * @returns {Promise<void>} Resolves when data has been fetched and applied.
   */
  async function fetchInitialTransactionData(): Promise<void> {
    try {
      if (isPaymentDataLoaded.value) return;

      const { data } = await httpService.getTransactionData();

      const {
        totalProcessingFeePercentage: mockTotalProcessingFeePercentage,
        totalProcessingFeeFixed: mockTotalProcessingFeeFixed,
      } = data.mockOrganization;

      // Convert organization-level fee percentage into internal representation
      totalProcessingFeePercentage.value = new Decimal(
        mockTotalProcessingFeePercentage ?? FALLBACK_ZERO_STRING,
      ).times(PERCENTAGE_DIVISOR);
      totalProcessingFeeFixedInCents.value = new Decimal(
        mockTotalProcessingFeeFixed ?? FALLBACK_ZERO_STRING,
      );
      locations.value = data.mockLocations;
      paymentReaders.value = data.mockLocationReaders;

      // default to select the first location
      if (data?.mockLocations.length > 0) {
        selectLocation(data.mockLocations[0].id ?? null);
      }

      isPaymentDataLoaded.value = true;
    } catch (error) {
      console.error('fetchInitialTransactionData error:', error);
      throw error;
    }
  }

  /**
   * Recalculate tax, patient fee and total amount for the active transaction.
   * Steps performed:
   * 1. Calculate tax = amountInCents * currentTaxRate
   * 2. Determine fee via FeeStrategyFactory based on paymentMethod
   * 3. Compute total = amount + tax + fee
   *
   * All monetary values are handled as Decimal to avoid floating point issues.
   * Errors are caught and logged to avoid crashing reactive watchers.
   *
   * @returns {void}
   */
  function _recalculateTotals(): void {
    try {
      // --- TAX ---
      const calculatedTax = transaction.value.amountInCents.mul(
        currentTaxRate.value,
      );

      transaction.value.calculatedTaxInCents = calculatedTax;

      // --- FEE ---
      const strategy = FeeStrategyFactory.create(
        transaction.value.paymentMethod,
      );

      const fee = strategy.calculate(
        transaction.value,
        patientProcessingFeePercentage.value,
        patientProcessingFeeFixedInCents.value,
      );

      transaction.value.patientFeeInCents = fee;

      // --- TOTAL ---
      const total = transaction.value.amountInCents
        .plus(calculatedTax)
        .plus(fee);

      transaction.value.totalAmountInCents = total;
    } catch (error) {
      console.error('Error recalculating totals:', error);
    }
  }

  // --- WATCHERS ---
  watch(
    [
      () => transaction.value.amountInCents,
      () => transaction.value.paymentMethod,
      currentTaxRate,
      patientProcessingFeePercentage,
      patientProcessingFeeFixedInCents,
    ],
    _recalculateTotals,
  );

  return {
    // --- STATE ---
    isPaymentDataLoaded,
    locations,
    paymentReaders,
    transaction,
    patientProcessingFeePercentage,
    patientProcessingFeeFixedInCents,
    totalProcessingFeePercentage,
    totalProcessingFeeFixedInCents,
    // --- GETTERS ---
    subtotal,
    selectedLocation,
    selectedReader,
    currentTaxRate,
    // --- ACTIONS ---
    resetTransaction,
    submitTransaction,
    fetchInitialTransactionData,
    // --- SETTERS ---
    selectLocation,
    updatePaymentAmount,
    updatePaymentDescription,
    updatePatientFee,
    selectPaymentMethod,
    selectPaymentReader,
  };
});
