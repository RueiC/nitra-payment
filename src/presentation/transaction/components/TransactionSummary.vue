<script setup lang="ts">
import { computed, inject } from 'vue';
import { Notify } from 'quasar';
// --- MODEL ---
import { PaymentMethod, TransactionMethod } from '@/models/enums/index';
import { ReaderStatus } from '@/models/enums';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';
import { useLocationSelector } from '@/services/composables/useLocationSelector';
import { FeeStrategyFactory } from '@/services/factories/FeeStrategyFactory';
import { useLoading } from '@/services/composables/useLoading';
// --- UTILS ---
import { formatCurrency } from '@/utils/formatter';
// --- GLOBAL COMPONENTS ---
import Button from '@/presentation/components/Button.vue';
// --- LOCAL COMPONENTS ---
import SubtotalItem from '@/presentation/transaction/components/SubtotalItem.vue';
// --- CONSTANTS ---
import {
  PERCENTAGE_DIVISOR,
  DEFAULT_DECIMAL_PLACES,
  MINIMUM_TOTAL_AMOUNT_IN_CENTS,
} from '@/constant/index';

// Transaction store and composables used by this summary component.
const transactionStore = useTransactionStore();
const { locationOptions, selectedLocationId } = useLocationSelector();
const { isLoading, setLoading } = useLoading();

// Fee strategy instance for card payments. Used to calculate the patient's fee.
const strategy = FeeStrategyFactory.create(PaymentMethod.Card);

// Injected providers from the parent view for modal control.
const ModalKey = inject<any>('ModalKey');
const handleOpenModal = inject<((k: any) => void) | undefined>(
  'handleOpenModal',
);

/**
 * Whether the current total amount is below the required minimum.
 * Used to disable actions when the total is negative or under the minimum.
 */
const belowMinimumTotalAmount = computed<boolean>(() => {
  return (
    transactionStore.transaction.totalAmountInCents.lessThan(0) ||
    transactionStore.transaction.totalAmountInCents.lessThanOrEqualTo(
      MINIMUM_TOTAL_AMOUNT_IN_CENTS,
    )
  );
});

/**
 * Options for the reader select control. Filters readers by the selected
 * location and maps to a UI-friendly option shape with display classes.
 */
const readerOptions = computed(() => {
  const readers =
    transactionStore.paymentReaders?.filter((reader) => {
      return (
        reader.locationId === transactionStore.transaction.selectedLocationId
      );
    }) ?? [];

  return readers.map((reader) => ({
    label: reader.label,
    value: reader.id,

    disable: reader.status !== ReaderStatus.Online,
    disabled: reader.status !== ReaderStatus.Online,

    optClass:
      reader.status !== ReaderStatus.Online
        ? 'transaction-summary__reader-offline'
        : 'transaction-summary__reader-online',

    status: reader.status,
  }));
});

/**
 * Two-way computed binding for the selected reader id. Writing to this
 * computed updates the transaction store's selected reader.
 */
const selectedReaderId = computed({
  get(): number | null {
    return transactionStore.transaction.selectedReaderId ?? null;
  },

  set(newValue: number): void {
    transactionStore.selectPaymentReader(newValue);
  },
});

/**
 * Human-readable tax rate string for display (e.g. "5.00").
 */
const formattedTaxRate = computed(() => {
  return transactionStore.currentTaxRate
    .times(PERCENTAGE_DIVISOR)
    .toFixed(DEFAULT_DECIMAL_PLACES);
});

/**
 * Total amount customer would pay when using a card (subtotal + patient fee).
 * Calculated using the card fee strategy to include processing fees.
 */
const payByCardAmount = computed(() => {
  const fee = strategy.calculate(
    transactionStore.transaction,
    transactionStore.patientProcessingFeePercentage,
    transactionStore.patientProcessingFeeFixedInCents,
  );

  return transactionStore.subtotal.plus(fee).toNumber();
});

/**
 * Safely invoke parent-provided modal opener if available.
 *
 * @param {any} key - Modal key to open.
 * @returns {void}
 */
function safeInvokeHandleOpenModal(key: any): void {
  if (typeof handleOpenModal === 'function') {
    handleOpenModal(key);
  }
}

/**
 * Submit a cash transaction via the transaction store. Uses `useLoading`
 * to guard concurrent submissions and displays success/error notifications.
 *
 * @returns {Promise<void>} Resolves when the submission finishes.
 */
const handleSubmitCashTransaction = async () => {
  try {
    if (isLoading.value) return;
    setLoading(true);

    await transactionStore.submitTransaction(
      TransactionMethod.Cash,
      transactionStore.transaction,
    );
    Notify.create({
      type: 'positive',
      message: '現金交易成功，交易完成',
    });
  } catch (err: unknown) {
    console.log(err);
    const errorMessage = (err as any)?.message ?? '提交現金交易失敗';
    Notify.create({
      type: 'negative',
      message: errorMessage,
    });
  } finally {
    setLoading(false);
  }
};
</script>

<template>
  <aside class="transaction-summary">
    <template v-if="transactionStore.isPaymentDataLoaded">
      <header class="transaction-summary__header">
        <h2 class="transaction-summary__title">Summary</h2>
      </header>

      <section class="transaction-summary__list">
        <SubtotalItem
          label="Subtotal"
          :value="
            formatCurrency(
              transactionStore.transaction.amountInCents.toNumber(),
            )
          "
          size="sm"
        />
        <SubtotalItem
          :label="`Tax(${formattedTaxRate}%)`"
          :value="
            formatCurrency(
              transactionStore.transaction.calculatedTaxInCents.toNumber(),
            )
          "
          size="sm"
        />
        <hr />
        <SubtotalItem
          label="Total"
          :value="formatCurrency(transactionStore.subtotal.toNumber())"
          size="md"
        />

        <div class="transaction-summary__toggle">
          <button
            class="transaction-summary__toggle-item"
            :class="{
              'transaction-summary__toggle-item--selected':
                transactionStore.transaction.paymentMethod ===
                PaymentMethod.Cash,
            }"
            @click="transactionStore.selectPaymentMethod(PaymentMethod.Cash)"
            type="button"
          >
            <q-icon name="fa-solid fa-sack-dollar" size="16px" />
            Pay by {{ PaymentMethod.Cash }}
            {{ formatCurrency(transactionStore.subtotal.toNumber()) }}
          </button>
          <button
            class="transaction-summary__toggle-item"
            :class="{
              'transaction-summary__toggle-item--selected':
                transactionStore.transaction.paymentMethod ===
                PaymentMethod.Card,
            }"
            @click="transactionStore.selectPaymentMethod(PaymentMethod.Card)"
            type="button"
          >
            <q-icon name="fa-solid fa-credit-card" size="16px" />
            Pay by {{ PaymentMethod.Card }}
            {{ formatCurrency(payByCardAmount) }}
          </button>
        </div>

        <template
          v-if="
            transactionStore.transaction.paymentMethod === PaymentMethod.Card
          "
        >
          <SubtotalItem size="md">
            <template #label>
              <div class="summary-list-item-label-wrapper">
                <span class="summary-list-item-label"
                  >Patient Card Processing Fee</span
                >
                <button
                  class="summary-list-item-button"
                  type="button"
                  @click="safeInvokeHandleOpenModal(ModalKey.ProcessingFee)"
                >
                  Edit
                </button>
              </div>
            </template>

            <template #value>
              <span class="summary-list-item-value">
                {{
                  formatCurrency(
                    transactionStore.transaction.patientFeeInCents.toNumber(),
                  )
                }}
              </span>
            </template>
          </SubtotalItem>

          <hr />
        </template>

        <SubtotalItem size="md">
          <template #label>
            <span class="summary-list-item-summary-label">
              Pay by {{ transactionStore.transaction.paymentMethod }} Total
            </span>
          </template>
          <template #value>
            <span
              class="summary-list-item-summary-value"
              :class="{
                'summary-list-item-summary-value--available':
                  !belowMinimumTotalAmount,
                'summary-list-item-summary-value--unavailable':
                  belowMinimumTotalAmount,
              }"
            >
              {{
                formatCurrency(
                  transactionStore.transaction.totalAmountInCents.toNumber(),
                )
              }}
            </span>
          </template>
        </SubtotalItem>
        <span v-if="belowMinimumTotalAmount" class="warning--text"
          >*Total amount falls below the required minimum of
          {{ formatCurrency(MINIMUM_TOTAL_AMOUNT_IN_CENTS) }}</span
        >
      </section>

      <footer class="transaction-summary__footer">
        <div class="transaction-summary__selectors">
          <q-select
            v-model="selectedLocationId"
            class="transaction-summary__location-selector"
            :display-value="transactionStore.selectedLocation?.name"
            :options="locationOptions"
            color="black"
            bg-color="transparent"
            dense
            borderless
          >
            <template v-slot:prepend>
              <q-icon name="fas fa-location-dot" size="12px" />
            </template>
          </q-select>

          <q-select
            v-if="
              transactionStore.transaction.paymentMethod === PaymentMethod.Card
            "
            v-model="selectedReaderId"
            class="transaction-summary__reader-selector"
            :display-value="transactionStore.selectedReader?.label"
            :options="readerOptions"
            dropdown-icon="fas fa-chevron-down"
            label="Device Reader"
            color="black"
            filled
            dense
          >
          </q-select>
        </div>

        <div class="transaction-summary__actions">
          <template
            v-if="
              transactionStore.transaction.paymentMethod === PaymentMethod.Card
            "
          >
            <Button
              text="Initiate Payment on Reader"
              button-style="primary"
              :disabled="
                belowMinimumTotalAmount ||
                !transactionStore.transaction.selectedReaderId
              "
              @click="safeInvokeHandleOpenModal(ModalKey.InitiatePayment)"
            >
              <template #icon-prepend>
                <q-icon name="fa-solid fa-tablet-screen-button" size="16px" />
              </template>
            </Button>
            <Button
              text="Input Card Number Manually"
              button-style="secondary"
              :disabled="belowMinimumTotalAmount"
              @click="safeInvokeHandleOpenModal(ModalKey.CreditCard)"
            >
              <template #icon-prepend>
                <q-icon name="fa-solid fa-credit-card" size="16px" />
              </template>
            </Button>
          </template>

          <Button
            v-else
            text="Log Payment"
            button-style="primary"
            :is-loading="isLoading"
            :disabled="belowMinimumTotalAmount"
            @click="handleSubmitCashTransaction"
          >
            <template #icon-prepend>
              <q-icon name="fa-solid fa-money-bill-wave" size="16px" />
            </template>
          </Button>
        </div>
      </footer>
    </template>

    <div v-else class="spinner-wrapper">
      <q-spinner-dots size="40px" color="primary" />
    </div>
  </aside>
</template>

<style lang="scss" scoped>
:deep(.transaction-summary__reader-offline) {
  color: #abb5ba !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

.warning--text {
  color: var(--q-color-red-500, #c71a1a);
  text-align: start;
  font-family: Inter;
  font-weight: 500;
  font-size: 10px;
  line-height: 100%;
  letter-spacing: 0.5%;
  width: 100%;
  padding-left: 16px;
}

.summary-list-item-summary-value {
  font-family: Inter;
  font-weight: 700;
  font-size: map-get($font-size, 'xl');
  line-height: 100%;
  letter-spacing: 0.5%;

  &--available {
    color: var(--q-color-green-500, #15b471);
  }

  &--unavailable {
    color: var(--q-color-red-500, #c71a1a);
  }
}

.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
}

.summary-list-item-label-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;

  .summary-list-item-button {
    color: var(--q-color-teal-400, #4a979b);
    font-weight: 400;
    font-size: 12px;
    leading-trim: NONE;
    line-height: 16px;
    letter-spacing: 0.5%;
    text-decoration: underline;
    text-decoration-style: solid;
    text-decoration-offset: 0%;
    text-decoration-thickness: 0%;
    padding: 0;

    border: none;
    background: transparent;

    cursor: pointer;
  }
}

.transaction-summary {
  grid-column: span 2 / span 2;
  border-left: 1px solid var(--q-color-gray-200, #d5dadc);

  &__header {
    padding: 26.5px 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    align-items: center;

    border-top: 1px solid var(--q-color-gray-200, #d5dadc);
    border-bottom: 1px solid var(--q-color-gray-200, #d5dadc);
    padding: 16px;
  }

  &__footer {
    padding: 16px;
  }

  &__location-selector {
    & :deep(.q-field__marginal),
    & :deep(.q-field__native),
    & :deep(.q-field__control) {
      height: fit-content;
      min-height: initial;
      padding: 0;
    }

    & :deep(.q-field__control) {
      display: flex;
      align-items: center;
      gap: 4px;

      border-radius: 8px;
      background: var(--q-color-gray-100, #e3e6e8);
      width: fit-content;
    }

    & :deep(.q-select__dropdown-icon) {
      width: 12px;
      height: 12px;
      font-size: 12px;
    }

    & :deep(.q-field__native) {
      color: var(--q-color-black, #000000);
    }
  }

  &__reader-selector {
    & :deep(.q-field__control) {
      border-radius: 8px;
      background: var(--q-color-gray-100, #e3e6e8);
      padding: 0 12px;
      height: 37px;
    }

    & :deep(.q-select__dropdown-icon) {
      width: 12px;
      height: 12px;
      font-size: 12px;
    }

    & :deep(.q-field__native) {
      color: var(--q-color-black, #000000);
    }
  }

  &__selectors {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 12px;

    margin-top: 12px;

    & button {
      width: 100%;
    }
  }

  &__toggle {
    display: flex;

    width: 100%;
    border: 1px solid var(--q-color-teal-100, #a9d4d6);
    border-radius: 6px;
    overflow: hidden;
  }

  &__toggle-item {
    flex: 1;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    padding: 10px 0;

    color: var(--q-color-teal-700, #264d4f);
    background: var(--q-color-white, #fff);
    font-weight: 500;
    font-size: map.get($font-size, 'xss');
    line-height: 100%;
    letter-spacing: 0.5%;

    border: none;

    cursor: pointer;

    &--selected {
      color: var(--q-color-teal-700, #264d4f);
      background: var(--q-color-teal-100, #a9d4d6);
    }
  }

  &__item-label {
    color: var(--q-color-gray-700, #5c6970);
    font-weight: 500;
    font-size: map.get($font-size, 'xs');
    line-height: 100%;
    letter-spacing: 0.5%;

    margin-right: 12px;
  }

  &__item-button {
    color: var(--q-color-teal-400, #4a979b);
    font-weight: 400;
    font-size: map.get($font-size, 'xs');
    line-height: 16px;
    letter-spacing: 0.5%;
    text-decoration: underline;
    text-decoration-style: solid;
  }

  &__item-value {
    color: var(--q-color-gray-700, #5c6970);

    font-weight: 500;
    font-size: map.get($font-size, 'xs');
    line-height: 100%;
    letter-spacing: 0.5%;
  }

  &__summary-label {
    color: var(--q-color-black, #000000);
    font-weight: 700;
    font-size: map.get($font-size, 'xs');
    line-height: 100%;
    letter-spacing: 0.5%;
  }

  &__summary-value {
    color: var(--q-color-green-500, #15b471);
    font-weight: 700;
    font-size: map.get($font-size, 'xl');
    line-height: 100%;
    letter-spacing: 0.5%;
  }

  &__title {
    color: var(--q-color-black, #000000);
    font-weight: 700;
    font-size: map.get($font-size, 'md');
    line-height: 100%;
  }

  &__actions-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;

    width: 100%;

    & button {
      font-weight: 600;
      font-size: map.get($font-size, 'sm');
      line-height: 20px;
      letter-spacing: 0.5%;

      padding: 8px 0;
      border-radius: 6px;
    }

    & .primary {
      color: var(--q-color-white, #ffffff);
      background: var(--q-color-orange-400, #fb7429);
    }

    & .secondary {
      color: var(--q-color-orange-400, #fb7429);
      background: var(--q-color-orange-100, #fee5d7);
    }
  }

  & hr {
    width: 100%;
    margin: 0;
  }
}
</style>
