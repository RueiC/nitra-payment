<script setup lang="ts">
// --- SERVICES ---
import { useTransactionStore } from '@/services/stores/transactionStore';
import { useLocationSelector } from '@/services/composables/useLocationSelector';

const transactionStore = useTransactionStore();
const { locationOptions, selectedLocationId } = useLocationSelector();
</script>

<template>
  <header class="transaction-head">
    <div class="transaction-head__left">
      <h1 class="transaction-head__title">Collect Payment</h1>

      <q-select
        v-if="transactionStore.isPaymentDataLoaded"
        v-model="selectedLocationId"
        class="transaction-head__location-selector"
        :display-value="transactionStore.selectedLocation?.name"
        :options="locationOptions"
        dropdown-icon="fas fa-chevron-down"
        color="black"
        filled
        dense
      >
        <template v-slot:prepend>
          <q-icon name="fas fa-location-dot" size="12px" />
        </template>
      </q-select>
    </div>

    <button
      v-if="transactionStore.transaction.amountInCents.greaterThan(0)"
      class="transaction-head__reset-button"
      type="button"
      @click="transactionStore.resetTransaction"
    >
      Reset Payment
    </button>
  </header>
</template>

<style lang="scss" scoped>
.transaction-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;

  margin-bottom: 16px;

  &__location-selector {
    & :deep(.q-field__control) {
      border-radius: 8px;
      background: var(--q-color-gray-100, #e3e6e8);
      padding: 0 12px;
      height: 37px;
    }

    & :deep(.q-select__dropdown-icon) {
      width: 12px;
      height: 12px;
      font-size: map.get($font-size, 'xs');
    }

    & :deep(.q-field__native) {
      color: var(--q-color-black, #000000);
    }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 24px;

    & .transaction-head__title {
      color: var(--q-color-black, #000000);
      font-size: map.get($font-size, '2xl');
      font-weight: 700;
      line-height: 100%;
    }
  }

  &__reset-button {
    color: var(--q-color-red-400, #e43030);
    background: transparent;
    border: none;
    outline: none;
    font-weight: 600;
    font-size: map.get($font-size, 'sm');
    line-height: 20px;
    letter-spacing: 0.5%;

    padding: 8px 16px;

    cursor: pointer;
  }
}
</style>
