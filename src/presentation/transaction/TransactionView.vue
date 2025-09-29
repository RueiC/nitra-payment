<script setup lang="ts">
import { ref, onBeforeMount, provide, type Component } from 'vue';
import { Notify } from 'quasar';
// --- GLOBAL COMPONENTS ---
import MainWrapper from '@/presentation/layouts/MainWrapper.vue';
// --- LOCAL COMPONENTS ---
import CreditCard from '@/presentation/transaction/components/modals/CreditCard.vue';
import ProcessingFee from '@/presentation/transaction/components/modals/ProcessingFee.vue';
import InitiatePayment from '@/presentation/transaction/components/modals/InitiatePayment.vue';
import TransactionHead from '@/presentation/transaction/components/TransactionHead.vue';
import TransactionAmount from '@/presentation/transaction/components/TransactionAmount.vue';
import TransactionSummary from '@/presentation/transaction/components/TransactionSummary.vue';
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';

enum ModalKey {
  CreditCard = 'CreditCard',
  ProcessingFee = 'ProcessingFee',
  InitiatePayment = 'InitiatePayment',
}

const transactionStore = useTransactionStore();
const currentModal = ref<ModalKey | null>(null);
const modals: Record<ModalKey, Component> = {
  [ModalKey.CreditCard]: CreditCard,
  [ModalKey.ProcessingFee]: ProcessingFee,
  [ModalKey.InitiatePayment]: InitiatePayment,
};

function handleOpenModal(modalKey: ModalKey): void {
  if (
    modalKey === ModalKey.InitiatePayment &&
    transactionStore.transaction.amountInCents.lessThanOrEqualTo(0)
  ) {
    Notify.create({
      type: 'warning',
      message: '金額需大於 0 才能進行付款',
    });
    return;
  }

  currentModal.value = modalKey;
}

function handleCloseModal(): void {
  currentModal.value = null;
}

async function fetchInitialTransactionData(): Promise<void> {
  try {
    await transactionStore.fetchInitialTransactionData();
  } catch (err: unknown) {
    console.error('Error fetching initial transaction data:', err);
    const errorMessage =
      (err as any)?.message ?? '取得初始資料失敗，請稍後重試';
    Notify.create({
      type: 'negative',
      message: errorMessage,
    });
  }
}

onBeforeMount(fetchInitialTransactionData);

provide('ModalKey', ModalKey);
provide('currentModal', currentModal);
provide('handleOpenModal', handleOpenModal);
</script>

<template>
  <MainWrapper>
    <TransactionHead />

    <div class="main-content">
      <TransactionAmount />
      <TransactionSummary />
    </div>

    <component
      v-if="currentModal && modals[currentModal]"
      :is="modals[currentModal]"
      @close="handleCloseModal"
    ></component>
  </MainWrapper>
</template>

<style lang="scss" scoped>
.main-content {
  display: grid;
  grid-template-columns: repeat(6, 1fr);

  height: 100%;
  border-radius: 8px;
  border: 1px solid var(--q-color-gray-200, #d5dadc);
}
</style>
