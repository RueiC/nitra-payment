<script setup lang="ts">
import { ref } from 'vue';
import type { QForm } from 'quasar';
import { Notify } from 'quasar';
// --- MODEL ---
import { TransactionMethod } from '@/models/enums/index';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';
import { useLoading } from '@/services/composables/useLoading';
// --- GLOBAL COMPONENTS ---
import BaseModal from '@/presentation/components/modals/BaseModal.vue';
// --- CONSTANTS ---
import { mockCountries } from '@/constant/index';
// --- UTILS ---
import { formatCurrency } from '@/utils/formatter';
import Button from '@/presentation/components/Button.vue';

import {
  isRequired,
  isValidCardNumber,
  isValidExpirationDate,
  isValidCvc,
} from '@/utils/validators';

const emit = defineEmits(['close']);

const transactionStore = useTransactionStore();
const { isLoading, setLoading } = useLoading();

const creditCardForm = ref<QForm | null>(null);
const creditCardDetails = ref({
  name: '',
  cardNumber: '',
  expirationDate: '',
  cvc: '',
  country: '',
  zip: '',
});

async function handleSubmit(): Promise<void> {
  if (isLoading.value) return;
  setLoading(true);

  try {
    await transactionStore.submitTransaction(
      TransactionMethod.Manually,
      transactionStore.transaction,
    );

    Notify.create({
      type: 'positive',
      message: '信用卡資料提交成功，交易完成',
    });
    emit('close');
  } catch (err: unknown) {
    console.error('Error submitting credit card details:', err);
    const errorMessage = (err as any)?.message ?? '提交信用卡資料失敗';
    Notify.create({
      type: 'negative',
      message: errorMessage,
    });
  } finally {
    setLoading(false);
  }
}

function handleCloseModal(): void {
  emit('close');
}

async function handleTriggerValidation(): Promise<void> {
  if (!creditCardForm.value) return;

  const success = await creditCardForm.value.validate();

  if (success) {
    transactionStore.transaction.creditCardDetails = creditCardDetails.value;
    handleSubmit();
  } else {
    console.log('Validation failed!');
  }
}
</script>

<template>
  <BaseModal @close="handleCloseModal">
    <template #header="{ close }">
      <section class="credit-card__header">
        <h3 class="credit-card__title">Credit Card Details</h3>
        <q-icon name="fa-solid fa-xmark" size="18px" @click="close" />
      </section>
    </template>

    <template #body>
      <section class="credit-card__body">
        <q-form
          ref="creditCardForm"
          class="credit-card__form q-gutter-md"
          @submit="handleSubmit"
        >
          <q-input
            filled
            v-model="creditCardDetails.name"
            label="Name on Card"
            :rules="[isRequired]"
            lazy-rules
          />

          <q-input
            filled
            v-model="creditCardDetails.cardNumber"
            label="Card Number"
            mask="#### #### #### ####"
            :rules="[isRequired, isValidCardNumber]"
            lazy-rules
          />

          <div class="credit-card__form-row">
            <q-input
              filled
              v-model="creditCardDetails.expirationDate"
              label="Expiration Date"
              mask="##/##"
              placeholder="MM/YY"
              :rules="[isRequired, isValidExpirationDate]"
              lazy-rules
            />
            <q-input
              filled
              v-model="creditCardDetails.cvc"
              label="CVC"
              mask="###"
              :rules="[isRequired, isValidCvc]"
              lazy-rules
            />
          </div>

          <div class="credit-card__form-row">
            <q-select
              filled
              v-model="creditCardDetails.country"
              :options="mockCountries"
              label="Country"
              :rules="[isRequired]"
              lazy-rules
            />
            <q-input
              filled
              v-model="creditCardDetails.zip"
              label="ZIP"
              mask="#####"
              :rules="[isRequired]"
              lazy-rules
            />
          </div>
        </q-form>
      </section>
    </template>

    <template #footer="{ close }">
      <section class="credit-card__footer">
        <div class="credit-card__button-group">
          <Button text="Cancel" button-style="borderless" @click="close" />

          <Button
            :text="`Pay ${formatCurrency(
              transactionStore.transaction.totalAmountInCents.toNumber(),
            )}`"
            :is-loading="isLoading"
            button-style="primary"
            @click="handleTriggerValidation"
          />
        </div>
      </section>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.credit-card {
  &__form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 12px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 24px 0;

    & i {
      cursor: pointer;
    }
  }

  &__title {
    font-weight: 700;
    font-size: map.get($font-size, '2xl');
    line-height: 100%;
    letter-spacing: 0.5%;
    margin: 0;
  }

  &__footer {
    width: 100%;
  }

  &__button-group {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & button {
      font-weight: 600;
      font-size: map.get($font-size, 'sm');
      line-height: 20px;
      letter-spacing: 0.5%;
      padding: 8px 16px;

      border-radius: 6px;
    }
  }
}
</style>
