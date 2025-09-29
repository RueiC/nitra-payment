<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Notify } from 'quasar';
// --- MODEL ---
import { TransactionMethod } from '@/models/enums/index';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';
import { useCounter } from '@/services/composables/useCounter';
import { useLoading } from '@/services/composables/useLoading';
// --- GLOBAL COMPONENTS ---
import BaseModal from '@/presentation/components/modals/BaseModal.vue';
import Button from '@/presentation/components/Button.vue';

const emit = defineEmits(['close']);

const transactionStore = useTransactionStore();
const { activeCounter, destroyCounter } = useCounter();
const { isLoading, setLoading } = useLoading();
const countdown = ref<number>(5);

const resetCountdown = (value = 5) => {
  countdown.value = value;
};

async function handleProcessPayment(): Promise<void> {
  if (isLoading.value) return;
  destroyCounter();
  setLoading(true);

  try {
    await transactionStore.submitTransaction(
      TransactionMethod.Reader,
      transactionStore.transaction,
    );

    resetCountdown();

    Notify.create({
      type: 'positive',
      message: '付款成功，交易完成',
    });
    emit('close');
  } catch (error) {
    console.error('Error processing payment:', error);
    const msg = (error as any)?.message || '處理付款時發生錯誤';
    Notify.create({
      type: 'negative',
      message: msg,
    });
  } finally {
    setLoading(false);
  }
}

function handleCloseModal(): void {
  destroyCounter();
  resetCountdown();
  emit('close');
}

onMounted(() => {
  activeCounter(() => {
    if (countdown.value <= 0) {
      handleProcessPayment();
    } else {
      countdown.value -= 1;
    }
  }, 1000);
});

onUnmounted(() => {
  destroyCounter();
  resetCountdown();
});
</script>

<template>
  <BaseModal @close="handleCloseModal">
    <template #body>
      <section class="initiate-payment__body">
        <figure class="initiate-payment__media">
          <img
            class="initiate-payment__image"
            src="@/assets/images/payment/card_payment_flatline.png"
            alt="transaction image"
          />
        </figure>

        <div class="initiate-payment__content">
          <h3 class="initiate-payment__title">
            <q-icon name="fa-solid fa-eye" size="16px" />
            Review Details with Patient
          </h3>

          <p class="initiate-payment__description">
            Review details of this transaction with the customer on the device
            reader. If everything looks good, proceed to process payment.
          </p>
        </div>

        <aside class="initiate-payment__auto">
          <p class="initiate-payment__countdown">
            Auto-Processing in <strong>{{ countdown }}s</strong>
          </p>
          <p class="initiate-payment__hint">Or click "Process Payment" below</p>
        </aside>
      </section>
    </template>

    <template #footer="{ close }">
      <section class="initiate-payment__footer">
        <div class="initiate-payment__buttons">
          <Button text="Cancel" button-style="borderless" @click="close" />

          <Button
            text="Process Payment"
            :is-loading="isLoading"
            button-style="primary"
            @click="handleProcessPayment"
          />
        </div>
      </section>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.initiate-payment {
  &__body {
    padding: 20px 24px 40px 24px;
  }

  &__media {
    width: 63px;
    height: 110px;

    margin: 0 auto 35px auto;
  }

  &__image {
    object-fit: contain;
  }

  /* content styles intentionally left empty */

  &__title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    color: #000000;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0.5%;

    margin: 0 0 8px 0;
  }

  &__description {
    color: #5c6970;
    text-align: center;

    font-weight: 400;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.5%;
    margin: 0 0 24px 0;
  }

  &__auto {
    margin: 0;
  }

  &__countdown {
    color: #162b2d;
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.5%;

    background: #cbe5e6;

    padding: 12px 0;
    margin: 0 0 4px 0;
    border-radius: 4px;

    & strong {
      font-weight: 700;
    }
  }

  &__hint {
    color: #5c6970;
    text-align: center;
    font-weight: 400;
    font-size: 9px;
    line-height: 100%;
    letter-spacing: 0.5%;
    margin: 0;
  }

  &__footer {
    width: 100%;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
