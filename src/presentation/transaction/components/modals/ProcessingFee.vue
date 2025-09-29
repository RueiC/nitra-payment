<script setup lang="ts">
import { ref, computed } from 'vue';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';
import { FeeStrategyFactory } from '@/services/factories/FeeStrategyFactory';
// --- GLOBAL COMPONENTS ---
import BaseModal from '@/presentation/components/modals/BaseModal.vue';
import Decimal from 'decimal.js';
// --- UTILS ---
import { formatCurrency } from '@/utils/formatter';

import {
  FALLBACK_ZERO_PERCENTAGE_STRING,
  FALLBACK_ZERO_STRING,
  PERCENTAGE_DIVISOR,
  DEFAULT_DECIMAL_PLACES,
} from '@/constant/index';

import Button from '@/presentation/components/Button.vue';

const emit = defineEmits(['close']);
const transactionStore = useTransactionStore();

const strategy = FeeStrategyFactory.create(
  transactionStore.transaction.paymentMethod,
);

const merchantPercentage = computed<Decimal>(() => {
  return transactionStore.totalProcessingFeePercentage.minus(
    patientPercentage.value,
  );
});

// numeric binding for QSlider (which expects a number)
const merchantPercentageForSlider = computed({
  get: (): number => {
    return Number(merchantPercentage.value.toFixed(DEFAULT_DECIMAL_PLACES));
  },
  set: (newVal: number) => {
    const newMerchantPercentage = new Decimal(newVal ?? 0);
    patientPercentage.value =
      transactionStore.totalProcessingFeePercentage.minus(
        newMerchantPercentage,
      );
  },
});

const merchantFixedInCents = computed<Decimal>(() => {
  return transactionStore.totalProcessingFeeFixedInCents.minus(
    patientFixedInCents.value,
  );
});

const patientPercentage = ref<Decimal>(
  transactionStore.patientProcessingFeePercentage,
);

const patientFixedInCents = ref<Decimal>(
  transactionStore.patientProcessingFeeFixedInCents,
);

const patientPercentageForInput = computed({
  get: () => {
    return (
      patientPercentage.value.toFixed(DEFAULT_DECIMAL_PLACES) ??
      FALLBACK_ZERO_PERCENTAGE_STRING
    );
  },
  set: (newPercentageValue) => {
    patientPercentage.value = new Decimal(
      newPercentageValue ?? FALLBACK_ZERO_STRING,
    );
  },
});

const patientFixedForInput = computed({
  get: () => {
    return (
      patientFixedInCents.value
        .div(PERCENTAGE_DIVISOR)
        .toFixed(DEFAULT_DECIMAL_PLACES) ?? FALLBACK_ZERO_PERCENTAGE_STRING
    );
  },
  set: (newFixedDollars) => {
    patientFixedInCents.value = new Decimal(
      newFixedDollars ?? FALLBACK_ZERO_STRING,
    ).times(PERCENTAGE_DIVISOR);
  },
});

const merchantPercentageForInput = computed({
  get: () => {
    return (
      merchantPercentage.value.toFixed(DEFAULT_DECIMAL_PLACES) ??
      FALLBACK_ZERO_PERCENTAGE_STRING
    );
  },
  set: (newPercentageValue) => {
    const newMerchantPercentage = new Decimal(
      newPercentageValue ?? FALLBACK_ZERO_STRING,
    );
    patientPercentage.value =
      transactionStore.totalProcessingFeePercentage.minus(
        newMerchantPercentage,
      );
  },
});

const merchantFixedForInput = computed({
  get: () => {
    return (
      merchantFixedInCents.value
        .div(PERCENTAGE_DIVISOR)
        .toFixed(DEFAULT_DECIMAL_PLACES) ?? FALLBACK_ZERO_PERCENTAGE_STRING
    );
  },
  set: (newFixedDollars) => {
    const newMerchantValueInCents = new Decimal(
      newFixedDollars ?? FALLBACK_ZERO_STRING,
    ).times(PERCENTAGE_DIVISOR);
    patientFixedInCents.value =
      transactionStore.totalProcessingFeeFixedInCents.minus(
        newMerchantValueInCents,
      );
  },
});

const merchantFeeInCents = computed(() => {
  return strategy.calculate(
    transactionStore.transaction,
    merchantPercentage.value,
    merchantFixedInCents.value,
  );
});

const patientFeeInCents = computed(() => {
  return strategy.calculate(
    transactionStore.transaction,
    patientPercentage.value,
    patientFixedInCents.value,
  );
});

function setPatientProcessingFeeToZero(): void {
  patientPercentage.value = new Decimal(FALLBACK_ZERO_STRING);
  patientFixedInCents.value = new Decimal(FALLBACK_ZERO_STRING);
}

function handleSubmit(): void {
  transactionStore.patientProcessingFeePercentage = patientPercentage.value;
  transactionStore.patientProcessingFeeFixedInCents = patientFixedInCents.value;
  emit('close');
}

function handleCloseModal(): void {
  emit('close');
}
</script>

<template>
  <BaseModal @close="handleCloseModal">
    <template #header="{ close }">
      <section class="processing-fee__header">
        <div class="processing-fee__title">
          <h3>Edit Merchant Processing Fee</h3>
          <span>Only applies to this transaction</span>
        </div>

        <q-icon name="fa-solid fa-xmark" size="18px" @click="close" />
      </section>
    </template>

    <template #body>
      <section class="processing-fee__body">
        <q-slider
          class="processing-fee__slider"
          v-model="merchantPercentageForSlider"
          :min="0"
          :max="3.5"
          :step="0.01"
          label
          :label-value="merchantPercentageForSlider + '%'"
          label-always
          color="purple"
        />

        <div class="processing-fee__form">
          <fieldset class="processing-fee__row">
            <label class="processing-fee__label" for="merchant-percentage"
              >Merchant processing fee</label
            >

            <div class="processing-fee__input-wrapper">
              <q-input
                id="merchant-percentage"
                class="processing-fee__input processing-fee__input--percentage"
                v-model="merchantPercentageForInput"
                suffix="%"
                mask="#.##"
                fill-mask="0"
                reverse-fill-mask
                input-class="text-center"
                step="0.01"
                min="0"
                :max="
                  transactionStore.totalProcessingFeePercentage.toFixed(
                    DEFAULT_DECIMAL_PLACES,
                  )
                "
                style="width: 87px"
                dense
                filled
              />
              <span class="processing-fee__unit-wrapper"
                >/
                {{
                  transactionStore.totalProcessingFeePercentage.toFixed(
                    DEFAULT_DECIMAL_PLACES,
                  )
                }}%</span
              >
            </div>

            <span class="processing-fee__plus">+</span>

            <div class="processing-fee__input-wrapper">
              <q-input
                id="merchant-fixed"
                class="processing-fee__input processing-fee__input--fixed"
                v-model="merchantFixedForInput"
                prefix="$"
                mask="#.##"
                fill-mask="0"
                reverse-fill-mask
                input-class="text-center"
                step="0.01"
                min="0"
                :max="
                  transactionStore.totalProcessingFeeFixedInCents
                    .div(PERCENTAGE_DIVISOR)
                    .toFixed(DEFAULT_DECIMAL_PLACES)
                "
                style="width: 87px"
                dense
                filled
              />
              <span class="processing-fee__unit-wrapper"
                >/
                {{
                  formatCurrency(
                    transactionStore.totalProcessingFeeFixedInCents.toNumber(),
                  )
                }}</span
              >
            </div>
          </fieldset>

          <fieldset class="processing-fee__row">
            <label class="processing-fee__label" for="patient-percentage"
              >Patient processing fee</label
            >

            <div class="processing-fee__input-wrapper">
              <q-input
                id="patient-percentage"
                class="processing-fee__input processing-fee__input--percentage"
                v-model="patientPercentageForInput"
                suffix="%"
                mask="#.##"
                fill-mask="0"
                reverse-fill-mask
                input-class="text-center"
                step="0.01"
                min="0"
                :max="
                  transactionStore.totalProcessingFeePercentage.toFixed(
                    DEFAULT_DECIMAL_PLACES,
                  )
                "
                style="width: 87px"
                dense
                filled
              />
              <span class="processing-fee__unit-wrapper"
                >/
                {{
                  transactionStore.totalProcessingFeePercentage.toFixed(
                    DEFAULT_DECIMAL_PLACES,
                  )
                }}%</span
              >
            </div>
            <span class="processing-fee__plus">+</span>

            <div class="processing-fee__input-wrapper">
              <q-input
                id="patient-fixed"
                class="processing-fee__input processing-fee__input--fixed"
                v-model="patientFixedForInput"
                prefix="$"
                mask="#.##"
                fill-mask="0"
                reverse-fill-mask
                input-class="text-center"
                step="0.01"
                min="0"
                :max="
                  transactionStore.totalProcessingFeeFixedInCents
                    .div(PERCENTAGE_DIVISOR)
                    .toFixed(DEFAULT_DECIMAL_PLACES)
                "
                style="width: 87px"
                dense
                filled
              />
              <span class="processing-fee__unit-wrapper"
                >/
                {{
                  formatCurrency(
                    transactionStore.totalProcessingFeeFixedInCents.toNumber(),
                  )
                }}</span
              >
            </div>
          </fieldset>

          <button
            class="processing-fee__reset-button"
            type="button"
            @click="setPatientProcessingFeeToZero"
          >
            Set patient processing fee to 0
          </button>
        </div>

        <p class="processing-fee__summary">
          On this
          {{
            formatCurrency(
              transactionStore.transaction.amountInCents.toNumber(),
            )
          }}
          transaction, you pay
          <b>{{ formatCurrency(merchantFeeInCents.toNumber()) }}</b
          >, and patient pays
          <b>{{ formatCurrency(patientFeeInCents.toNumber()) }}</b>
        </p>
      </section>
    </template>

    <template #footer="{ close }">
      <section class="processing-fee__footer">
        <div class="processing-fee__button-group">
          <Button text="Cancel" button-style="borderless" @click="close" />

          <Button text="Update" button-style="primary" @click="handleSubmit" />
        </div>
      </section>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.processing-fee {
  &__slider {
    margin-top: 56px;
    margin-bottom: 16px;
    padding: 0 20px 16px 20px;
  }

  &__header {
    display: flex;
    justify-content: space-between;

    & i {
      cursor: pointer;
    }
  }

  &__title {
    display: flex;
    flex-direction: column;

    & h3 {
      font-weight: 700;
      font-size: 24px;
      line-height: 100%;
      letter-spacing: 0.5%;

      margin: 0 0 12px 0;
    }

    & span {
      font-weight: 500;
      font-size: 12px;
      line-height: 100%;
      letter-spacing: 0.5%;
    }
  }

  &__form {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 12px;
  }

  &__row {
    border: none;

    display: flex;
    align-items: center;
    gap: 12px;

    padding: 0;
    margin: 0;
  }

  &__label {
    color: #2e3538;

    font-weight: 500;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.5%;
  }

  &__unit-wrapper {
    color: #5c6970;

    font-weight: 400;
    font-size: 10px;
    line-height: 100%;
    letter-spacing: 0.5%;
  }

  &__plus {
    color: #5c6970;

    font-family: 'Font Awesome 6 Duotone';
    font-weight: 900;
    font-size: 12px;
    line-height: 100%;
    letter-spacing: 0%;
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__body {
    padding: 16px 0 24px 0;
  }

  &__reset-button {
    color: #4a979b;

    width: fit-content;
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    letter-spacing: 0.5%;

    vertical-align: middle;
    text-decoration: underline;
    text-decoration-style: solid;
    text-decoration-offset: 0%;
    text-decoration-thickness: 0%;

    margin: 0 auto 22px auto;
    border: none;
    background: none;

    cursor: pointer;
  }

  &__summary {
    color: #000000;
    font-weight: 700;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.5%;

    text-align: center;
  }

  &__footer {
    width: 100%;
    padding-top: 12px;
  }

  &__button-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
