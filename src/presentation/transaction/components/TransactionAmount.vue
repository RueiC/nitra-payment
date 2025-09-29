<script setup lang="ts">
import { computed } from 'vue';
import Decimal from 'decimal.js';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';

import {
  FALLBACK_ZERO_STRING,
  PERCENTAGE_DIVISOR,
  DEFAULT_DECIMAL_PLACES,
  MAX_LENGTH_OF_AMOUNT,
} from '@/constant/index';

const transactionStore = useTransactionStore();

const amountForInput = computed<string>({
  get(): string {
    return new Decimal(
      transactionStore.transaction.amountInCents ?? FALLBACK_ZERO_STRING,
    )
      .dividedBy(PERCENTAGE_DIVISOR)
      .toFixed(DEFAULT_DECIMAL_PLACES);
  },

  set(newDollarValue: string): void {
    const newCents = new Decimal(newDollarValue ?? FALLBACK_ZERO_STRING).times(
      PERCENTAGE_DIVISOR,
    );

    transactionStore.updatePaymentAmount(newCents);
  },
});

const inputWidth = computed<string>(() => {
  const value = amountForInput.value ?? '';

  const effectiveLength = value.split('').reduce((acc, ch) => {
    if (ch === '.') return acc + 0.5;
    return acc + 1;
  }, 0);

  const baseWidth = 25;
  const extraWidthPerChar = 45;

  return `${baseWidth + effectiveLength * extraWidthPerChar}px`;
});

const paymentDescription = computed({
  get(): string {
    return transactionStore.transaction.description ?? '';
  },

  set(newValue: string): void {
    transactionStore.updatePaymentDescription(newValue);
  },
});
</script>

<template>
  <section class="transaction-amount">
    <div
      v-if="transactionStore.isPaymentDataLoaded"
      class="transaction-amount__inner"
    >
      <fieldset class="transaction-amount__field">
        <label class="transaction-amount__label" for="amount-input"
          >Enter amount</label
        >

        <div class="transaction-amount__control">
          <q-input
            v-model="amountForInput"
            mask="#.##"
            fill-mask="0"
            reverse-fill-mask
            input-class="text-center"
            prefix="$"
            :maxlength="MAX_LENGTH_OF_AMOUNT"
            :input-style="`width: ${inputWidth}; font-size: 76px;`"
            borderless
          />
        </div>
      </fieldset>

      <q-input
        v-model="paymentDescription"
        input-class="transaction-amount__description-input"
        filled
        type="textarea"
        placeholder="Description (Optional)"
        color="black"
        maxlength="200"
      />
    </div>

    <div v-else class="spinner-wrapper">
      <q-spinner-dots size="40px" color="primary" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
:deep(.transaction-amount__description-input) {
  font-weight: 500;
  font-size: 15px;
  line-height: 100%;
  letter-spacing: 0.5%;

  width: 400px;
  height: 100px;

  resize: none;

  &::placeholder {
    color: var(--q-color-gray-600, #73838c);
  }

  & .q-field__control {
    border-radius: 8px 8px 0 0;
  }
}

.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
}

.transaction-amount {
  grid-column: span 4 / span 4;
  padding: 100px 0;

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 60px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: fit-content;
    border: none; /* reset default fieldset border */
  }

  &__label {
    color: var(--q-color-gray-700, #5c6970);
    font-weight: 500;
    font-size: map.get($font-size, 'lg');
    line-height: 100%;
    letter-spacing: 0.5%;
  }

  &__control {
    display: flex;
    align-items: center;

    width: fit-content;

    & :deep(.q-field__prefix) {
      transform: translateY(16px);
      font-family: 'Font Awesome 6 Duotone';
      font-weight: 900;
      font-style: Solid;
      font-size: map.get($font-size, '4xl');
      line-height: 100%;
      letter-spacing: 0%;
      padding: 0;
    }

    & :deep(.q-field__native) {
      font-family: 'Inter';
      font-weight: 700;
      font-size: 76px;
      line-height: 100%;
      letter-spacing: 0.5%;

      height: fit-content;
    }
  }

  &__currency {
    color: var(--q-color-black, #000000);
    font-weight: 900;
    font-size: map.get($font-size, '4xl');
    line-height: 100%;

    margin-bottom: 20px;
  }

  &__input {
    color: var(--q-color-black, #000000);
    font-weight: 700;
    font-size: 76px;
    line-height: 100%;
    letter-spacing: 0.5%;

    outline: none;
    border: none;
    background-color: transparent;

    &[type=number]::-webkit-outer-spin-button,
    /* 隱藏內層的箭頭 */
    &[type=number]::-webkit-inner-spin-button {
      -webkit-appearance: none; /* 移除預設的 WebKit 樣式 */
      margin: 0; /* 移除可能的邊界 */
    }

    /* 針對 Firefox */
    &[type='number'] {
      appearance: textfield;
      -moz-appearance: textfield; /* 讓它在 Firefox 中表現得像一個純文字輸入框 */
    }
  }
}
</style>
