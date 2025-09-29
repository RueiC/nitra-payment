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
    calculatedTaxInCents: new Decimal(FALLBACK_ZERO_STRING), // 付款稅率
    patientFeeInCents: new Decimal(FALLBACK_ZERO_STRING), // 病患分擔處理費
    totalAmountInCents: new Decimal(FALLBACK_ZERO_STRING), // 總處理費

    description: '', // 付款描述

    paymentMethod: PaymentMethod.Cash, // 付款方式
    transactionMethod: TransactionMethod.Cash, // 交易方式

    selectedLocationId: null, // 地點
    selectedReaderId: null, // 讀卡機

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

  // --- GETTERS ---
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

  const subtotal = computed<Decimal>(() => {
    const amountInCents = new Decimal(transaction.value.amountInCents);
    const calculatedTaxInCents = new Decimal(
      transaction.value.calculatedTaxInCents,
    );
    return amountInCents.plus(calculatedTaxInCents);
  });

  const selectedLocation = computed(() => {
    return (
      locations.value?.find(
        (loc: Location) => loc.id === transaction.value.selectedLocationId,
      ) ?? null
    );
  });

  const selectedReader = computed(() => {
    return (
      paymentReaders.value?.find(
        (reader: PaymentLocationReader) =>
          reader.id === transaction.value.selectedReaderId,
      ) ?? null
    );
  });

  const currentTaxRate = computed<Decimal>(() => {
    return new Decimal(
      selectedLocation.value?.taxRate ?? FALLBACK_ZERO_PERCENTAGE_STRING,
    );
  });

  // --- SETTERS ---
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

  function selectLocation(locationId: number | null): void {
    transaction.value.selectedReaderId = null;
    transaction.value.selectedLocationId = locationId;
  }

  function selectPaymentReader(selectedReaderId: number | null): void {
    transaction.value.selectedReaderId = selectedReaderId;
  }

  function updatePaymentAmount(newAmountInCents: Decimal): void {
    transaction.value.amountInCents = newAmountInCents;
  }

  function updatePatientFee(newFeeInCents: Decimal): void {
    transaction.value.patientFeeInCents = newFeeInCents;
  }

  function updatePaymentDescription(newDescription: string): void {
    transaction.value.description = newDescription;
  }

  function selectPaymentMethod(method: PaymentMethod): void {
    transaction.value.paymentMethod = method;
  }

  // --- ACTIONS ---
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

      resetTransaction();
    } catch (error) {
      console.error(
        `Error submitting transaction with method ${method}:`,
        error,
      );
      throw error;
    }
  }

  async function fetchInitialTransactionData(): Promise<void> {
    try {
      if (isPaymentDataLoaded.value) return;

      const { data } = await httpService.getTransactionData();

      const {
        totalProcessingFeePercentage: mockTotalProcessingFeePercentage,
        totalProcessingFeeFixed: mockTotalProcessingFeeFixed,
      } = data.mockOrganization;

      totalProcessingFeePercentage.value = new Decimal(
        mockTotalProcessingFeePercentage ?? FALLBACK_ZERO_STRING,
      ).times(PERCENTAGE_DIVISOR);
      totalProcessingFeeFixedInCents.value = new Decimal(
        mockTotalProcessingFeeFixed ?? FALLBACK_ZERO_STRING,
      );
      locations.value = data.mockLocations;
      paymentReaders.value = data.mockLocationReaders;

      // 預設選擇第一個地點
      if (data?.mockLocations.length > 0) {
        selectLocation(data.mockLocations[0].id ?? null);
      }

      isPaymentDataLoaded.value = true;
    } catch (error) {
      console.error('fetchInitialTransactionData error:', error);
      throw error;
    }
  }

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
    // --- GETTERS ---
    totalProcessingFeePercentage,
    totalProcessingFeeFixedInCents,
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
